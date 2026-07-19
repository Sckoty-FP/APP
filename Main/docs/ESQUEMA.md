# Modelo de datos — SGR-PPA

## Diagrama

```
usuarios (auth)
   │
   ├──< tecnicos.jefe_id
   ├──< expedientes.jefe_id        (obligatorio)
   └──< comentarios.usuario_id

tecnicos
   └──< expedientes.tecnico_id     (opcional)

expedientes
   └──< comentarios
            └──< imagenes
```

---

## Tipos

```sql
create type rol_usuario as enum ('jefe_zona', 'supervisor', 'jefe_equipo');

create type estado_expediente as enum (
  'pendiente',
  'en_gestion',
  'pendiente_revision',
  'rescatada',
  'cerrada'
);
```

---

## Tablas

### usuarios

Extiende `auth.users`. El `id` es el mismo que el de Supabase Auth.

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | = `auth.users.id` |
| nombre | text NOT NULL | |
| email | text NOT NULL UNIQUE | |
| rol | rol_usuario NOT NULL | |
| activo | boolean NOT NULL DEFAULT true | |
| creado_en | timestamptz DEFAULT now() | |

### tecnicos

Catálogo. **No son usuarios, no tienen acceso.**

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| nombre | text NOT NULL | |
| jefe_id | uuid NOT NULL → usuarios.id | siempre uno |
| activo | boolean NOT NULL DEFAULT true | |

### expedientes

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| instalacion | text NOT NULL | |
| mantenimiento | text NOT NULL **UNIQUE** | clave anti-duplicados en importación |
| jefe_id | uuid NOT NULL → usuarios.id | eje del sistema |
| tecnico_id | uuid NULL → tecnicos.id | descriptivo |
| motivo | text NOT NULL | motivo del rechazo |
| observaciones | text | iniciales |
| estado | estado_expediente NOT NULL DEFAULT 'pendiente' | |
| fecha_creacion | timestamptz NOT NULL DEFAULT now() | |
| fecha_rescate | timestamptz NULL | se rellena solo al pasar a `rescatada` |
| creado_por | uuid → usuarios.id | |

### comentarios

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| expediente_id | uuid NOT NULL → expedientes.id ON DELETE CASCADE | |
| usuario_id | uuid NOT NULL → usuarios.id | |
| comentario | text | puede ir vacío si solo hay imágenes |
| fecha | timestamptz NOT NULL DEFAULT now() | |

Sin DELETE ni UPDATE. Historial inmutable.

### imagenes

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| comentario_id | uuid NOT NULL → comentarios.id ON DELETE CASCADE | |
| url | text NOT NULL | ruta en Storage |
| fecha | timestamptz NOT NULL DEFAULT now() | |

### notificaciones

No está en el documento original, pero hace falta para los avisos en app.

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| usuario_id | uuid NOT NULL → usuarios.id | destinatario |
| expediente_id | uuid NULL → expedientes.id | |
| tipo | text NOT NULL | `comentario`, `cambio_estado`, `asignacion` |
| mensaje | text NOT NULL | |
| leida | boolean NOT NULL DEFAULT false | |
| fecha | timestamptz NOT NULL DEFAULT now() | |

---

## Índices

```sql
create index on expedientes (jefe_id);
create index on expedientes (estado);
create index on expedientes (fecha_creacion desc);
create index on comentarios (expediente_id, fecha desc);
create index on notificaciones (usuario_id, leida);
create index on tecnicos (jefe_id);
```

---

## Funciones auxiliares

```sql
-- Evita recursión infinita en las políticas RLS
create or replace function rol_actual()
returns rol_usuario
language sql stable security definer
as $$
  select rol from usuarios where id = auth.uid()
$$;
```

---

## Políticas RLS

RLS **activa en todas las tablas**.

| Tabla | jefe_zona | supervisor | jefe_equipo |
|---|---|---|---|
| usuarios | SELECT todo | ALL | SELECT todo (para nombres) |
| tecnicos | SELECT todo | ALL | SELECT todo |
| expedientes | SELECT todo | ALL | SELECT/UPDATE donde `jefe_id = auth.uid()` |
| comentarios | SELECT todo | INSERT + SELECT todo | SELECT + INSERT en sus expedientes |
| imagenes | SELECT todo | INSERT + SELECT todo | SELECT + INSERT en sus comentarios |
| notificaciones | las suyas | las suyas | las suyas |

Restricciones adicionales sobre `expedientes`:

- Nadie hace DELETE salvo `supervisor`.
- `jefe_equipo` solo puede cambiar el estado a `en_gestion` o
  `pendiente_revision`. Nunca a `rescatada` ni `cerrada` (trigger de validación).
- `fecha_rescate` la escribe un trigger, no el cliente.

---

## Storage

Bucket `fotos-expedientes`, privado.

Ruta: `{expediente_id}/{comentario_id}/{uuid}.jpg`

Políticas equivalentes a las de `imagenes`. Compresión en cliente antes de subir
(máx. 1600 px de lado mayor, calidad 0.8): las fotos de móvil pesan 4 MB.
