-- =============================================================
-- SGR-PPA · Esquema v1.0
-- Ejecutar en el SQL Editor de Supabase en este orden.
-- =============================================================


-- =============================================================
-- TIPOS ENUM
-- =============================================================

create type rol_usuario as enum ('jefe_zona', 'supervisor', 'jefe_equipo');

create type estado_expediente as enum (
  'pendiente',
  'en_gestion',
  'pendiente_revision',
  'rescatada',
  'cerrada'
);


-- =============================================================
-- TABLAS
-- =============================================================

-- usuarios
-- Extiende auth.users. El id es el mismo UUID que genera Supabase Auth.
create table usuarios (
  id         uuid primary key references auth.users(id) on delete cascade,
  nombre     text not null,
  email      text not null unique,
  rol        rol_usuario not null,
  activo     boolean not null default true,
  creado_en  timestamptz not null default now()
);

-- tecnicos
-- Catálogo. No son usuarios, no tienen acceso a la app.
create table tecnicos (
  id       uuid primary key default gen_random_uuid(),
  nombre   text not null,
  jefe_id  uuid not null references usuarios(id),
  activo   boolean not null default true
);

-- expedientes
create table expedientes (
  id              uuid primary key default gen_random_uuid(),
  instalacion     text not null,
  mantenimiento   text not null unique,   -- clave anti-duplicados en importación
  jefe_id         uuid not null references usuarios(id),
  tecnico_id      uuid references tecnicos(id),
  motivo          text not null,
  observaciones   text,
  estado          estado_expediente not null default 'pendiente',
  fecha_creacion  timestamptz not null default now(),
  fecha_rescate   timestamptz,            -- lo escribe un trigger, no el cliente
  creado_por      uuid references usuarios(id)
);

-- comentarios
-- Sin DELETE ni UPDATE. Historial inmutable.
create table comentarios (
  id             uuid primary key default gen_random_uuid(),
  expediente_id  uuid not null references expedientes(id) on delete cascade,
  usuario_id     uuid not null references usuarios(id),
  comentario     text,                    -- puede ir vacío si solo hay imágenes
  fecha          timestamptz not null default now()
);

-- imagenes
create table imagenes (
  id             uuid primary key default gen_random_uuid(),
  comentario_id  uuid not null references comentarios(id) on delete cascade,
  url            text not null,
  fecha          timestamptz not null default now()
);

-- notificaciones
create table notificaciones (
  id             uuid primary key default gen_random_uuid(),
  usuario_id     uuid not null references usuarios(id),
  expediente_id  uuid references expedientes(id),
  tipo           text not null,           -- 'comentario' | 'cambio_estado' | 'asignacion'
  mensaje        text not null,
  leida          boolean not null default false,
  fecha          timestamptz not null default now()
);


-- =============================================================
-- ÍNDICES
-- =============================================================

create index on expedientes (jefe_id);
create index on expedientes (estado);
create index on expedientes (fecha_creacion desc);
create index on comentarios (expediente_id, fecha desc);
create index on notificaciones (usuario_id, leida);
create index on tecnicos (jefe_id);


-- =============================================================
-- FUNCIÓN AUXILIAR
-- Evita recursión infinita en las políticas RLS.
-- security definer: se ejecuta con los permisos del creador,
-- no del usuario que llama. Así puede leer 'usuarios' sin RLS.
-- =============================================================

create or replace function rol_actual()
returns rol_usuario
language sql stable security definer
as $$
  select rol from usuarios where id = auth.uid()
$$;


-- =============================================================
-- TRIGGER: fecha_rescate automática
-- Al marcar un expediente como 'rescatada', la BD escribe
-- fecha_rescate. El cliente nunca toca ese campo.
-- =============================================================

create or replace function set_fecha_rescate()
returns trigger
language plpgsql
as $$
begin
  if new.estado = 'rescatada' and old.estado <> 'rescatada' then
    new.fecha_rescate = now();
  end if;
  if new.estado <> 'rescatada' then
    new.fecha_rescate = null;
  end if;
  return new;
end;
$$;

create trigger trg_fecha_rescate
before update on expedientes
for each row execute function set_fecha_rescate();


-- =============================================================
-- TRIGGER: validación de transiciones de estado por rol
-- jefe_equipo solo puede pasar a 'en_gestion' o
-- 'pendiente_revision'. Nunca a 'rescatada' ni 'cerrada'.
-- =============================================================

create or replace function validar_transicion_estado()
returns trigger
language plpgsql
as $$
declare
  rol_usuario rol_usuario;
begin
  select rol into rol_usuario from usuarios where id = auth.uid();

  if rol_usuario = 'jefe_equipo' then
    if new.estado not in ('en_gestion', 'pendiente_revision') then
      raise exception 'Transición de estado no permitida para jefe_equipo: %', new.estado;
    end if;
  end if;

  return new;
end;
$$;

create trigger trg_validar_estado
before update of estado on expedientes
for each row execute function validar_transicion_estado();


-- =============================================================
-- ACTIVAR RLS EN TODAS LAS TABLAS
-- =============================================================

alter table usuarios       enable row level security;
alter table tecnicos       enable row level security;
alter table expedientes    enable row level security;
alter table comentarios    enable row level security;
alter table imagenes       enable row level security;
alter table notificaciones enable row level security;


-- =============================================================
-- POLÍTICAS RLS
-- Regla de oro: la BD decide, nunca el frontend.
-- =============================================================

-- ── usuarios ──────────────────────────────────────────────────

-- Todos los roles ven todos los usuarios (necesario para mostrar nombres)
create policy "usuarios: todos pueden leer"
  on usuarios for select
  using (true);

-- Solo supervisor puede insertar, actualizar, eliminar usuarios
create policy "usuarios: supervisor gestiona"
  on usuarios for all
  using (rol_actual() = 'supervisor')
  with check (rol_actual() = 'supervisor');

-- ── tecnicos ──────────────────────────────────────────────────

create policy "tecnicos: todos pueden leer"
  on tecnicos for select
  using (true);

create policy "tecnicos: supervisor gestiona"
  on tecnicos for all
  using (rol_actual() = 'supervisor')
  with check (rol_actual() = 'supervisor');

-- ── expedientes ───────────────────────────────────────────────

-- jefe_zona y supervisor ven todo
-- jefe_equipo solo ve los suyos
create policy "expedientes: lectura por rol"
  on expedientes for select
  using (
    rol_actual() in ('jefe_zona', 'supervisor')
    or jefe_id = auth.uid()
  );

-- supervisor puede insertar cualquier expediente
create policy "expedientes: supervisor inserta"
  on expedientes for insert
  with check (rol_actual() = 'supervisor');

-- supervisor puede actualizar cualquier expediente
-- jefe_equipo solo puede actualizar los suyos (el trigger valida el estado)
create policy "expedientes: actualizar por rol"
  on expedientes for update
  using (
    rol_actual() = 'supervisor'
    or (rol_actual() = 'jefe_equipo' and jefe_id = auth.uid())
  )
  with check (
    rol_actual() = 'supervisor'
    or (rol_actual() = 'jefe_equipo' and jefe_id = auth.uid())
  );

-- solo supervisor puede eliminar
create policy "expedientes: supervisor elimina"
  on expedientes for delete
  using (rol_actual() = 'supervisor');

-- ── comentarios ───────────────────────────────────────────────

-- todos los roles leen todos los comentarios de los expedientes que ven
create policy "comentarios: lectura por rol"
  on comentarios for select
  using (
    rol_actual() in ('jefe_zona', 'supervisor')
    or exists (
      select 1 from expedientes e
      where e.id = expediente_id and e.jefe_id = auth.uid()
    )
  );

-- supervisor y jefe_equipo pueden insertar comentarios
-- jefe_equipo solo en sus expedientes
create policy "comentarios: insertar por rol"
  on comentarios for insert
  with check (
    rol_actual() = 'supervisor'
    or (
      rol_actual() = 'jefe_equipo'
      and exists (
        select 1 from expedientes e
        where e.id = expediente_id and e.jefe_id = auth.uid()
      )
    )
  );

-- sin UPDATE ni DELETE (historial inmutable)

-- ── imagenes ──────────────────────────────────────────────────

create policy "imagenes: lectura por rol"
  on imagenes for select
  using (
    rol_actual() in ('jefe_zona', 'supervisor')
    or exists (
      select 1 from comentarios c
        join expedientes e on e.id = c.expediente_id
      where c.id = comentario_id and e.jefe_id = auth.uid()
    )
  );

create policy "imagenes: insertar por rol"
  on imagenes for insert
  with check (
    rol_actual() = 'supervisor'
    or (
      rol_actual() = 'jefe_equipo'
      and exists (
        select 1 from comentarios c
          join expedientes e on e.id = c.expediente_id
        where c.id = comentario_id and e.jefe_id = auth.uid()
      )
    )
  );

-- ── notificaciones ────────────────────────────────────────────

-- cada usuario solo ve las suyas
create policy "notificaciones: solo las propias"
  on notificaciones for select
  using (usuario_id = auth.uid());

create policy "notificaciones: solo las propias update"
  on notificaciones for update
  using (usuario_id = auth.uid())
  with check (usuario_id = auth.uid());

-- supervisor puede insertar notificaciones para cualquier usuario
create policy "notificaciones: supervisor inserta"
  on notificaciones for insert
  with check (rol_actual() = 'supervisor');


-- =============================================================
-- STORAGE: bucket fotos-expedientes (privado)
-- Crear el bucket manualmente en Supabase > Storage con:
--   Name: fotos-expedientes
--   Public: false
-- Las políticas de Storage se configuran desde el panel
-- o con las instrucciones de la Fase 6.
-- =============================================================
