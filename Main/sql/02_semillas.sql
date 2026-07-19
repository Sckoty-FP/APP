-- =============================================================
-- SGR-PPA · Datos de prueba v1.0
-- ⚠️  EJECUTAR DESPUÉS de 01_esquema.sql
-- ⚠️  EJECUTAR DESPUÉS de crear los usuarios en Supabase Auth
--
-- Paso previo (Supabase > Authentication > Users > Add user):
--   Crear manualmente estos 5 usuarios con "Auto Confirm User":
--
--   Email                          Contraseña      Rol
--   ─────────────────────────────────────────────────────
--   jefazona@empresa.com           Test1234!       jefe_zona
--   supervisor@empresa.com         Test1234!       supervisor
--   jefe1@empresa.com              Test1234!       jefe_equipo
--   jefe2@empresa.com              Test1234!       jefe_equipo
--   jefe3@empresa.com              Test1234!       jefe_equipo
--
-- Luego reemplaza los UUIDs de abajo con los que Supabase asignó.
-- Los UUIDs reales los encontrás en Authentication > Users.
-- =============================================================


-- =============================================================
-- REEMPLAZA ESTOS VALORES con los UUIDs reales de Supabase Auth
-- =============================================================

do $$
declare
  id_jefe_zona   uuid := '00000000-0000-0000-0000-000000000001'; -- reemplazar
  id_supervisor  uuid := '00000000-0000-0000-0000-000000000002'; -- reemplazar
  id_jefe1       uuid := '00000000-0000-0000-0000-000000000003'; -- reemplazar
  id_jefe2       uuid := '00000000-0000-0000-0000-000000000004'; -- reemplazar
  id_jefe3       uuid := '00000000-0000-0000-0000-000000000005'; -- reemplazar

  -- técnicos
  id_tec1 uuid;
  id_tec2 uuid;
  id_tec3 uuid;
  id_tec4 uuid;
  id_tec5 uuid;
  id_tec6 uuid;

begin

  -- ── USUARIOS ────────────────────────────────────────────────
  insert into usuarios (id, nombre, email, rol) values
    (id_jefe_zona,  'Ana García',      'jefazona@empresa.com',    'jefe_zona'),
    (id_supervisor, 'Carlos Martínez', 'supervisor@empresa.com',  'supervisor'),
    (id_jefe1,      'Luis Pérez',      'jefe1@empresa.com',       'jefe_equipo'),
    (id_jefe2,      'Marta Sánchez',   'jefe2@empresa.com',       'jefe_equipo'),
    (id_jefe3,      'Roberto López',   'jefe3@empresa.com',       'jefe_equipo');


  -- ── TÉCNICOS ────────────────────────────────────────────────
  insert into tecnicos (nombre, jefe_id) values
    ('Antonio Ruiz',    id_jefe1) returning id into id_tec1;
  insert into tecnicos (nombre, jefe_id) values
    ('Elena Torres',    id_jefe1) returning id into id_tec2;
  insert into tecnicos (nombre, jefe_id) values
    ('David Moreno',    id_jefe2) returning id into id_tec3;
  insert into tecnicos (nombre, jefe_id) values
    ('Isabel Jiménez',  id_jefe2) returning id into id_tec4;
  insert into tecnicos (nombre, jefe_id) values
    ('Miguel Fernández',id_jefe3) returning id into id_tec5;
  insert into tecnicos (nombre, jefe_id) values
    ('Patricia Díaz',   id_jefe3) returning id into id_tec6;


  -- ── EXPEDIENTES (12) ─────────────────────────────────────────
  -- Repartidos entre jefes y estados para probar RLS y dashboards

  insert into expedientes
    (instalacion, mantenimiento, jefe_id, tecnico_id, motivo, observaciones, estado, creado_por)
  values

    -- jefe1 · pendiente (2)
    ('INS-001', 'MNT-2024-001', id_jefe1, id_tec1,
     'Sirena defectuosa', 'No activa en prueba',
     'pendiente', id_supervisor),

    ('INS-002', 'MNT-2024-002', id_jefe1, id_tec2,
     'Detector de humo sin respuesta', null,
     'pendiente', id_supervisor),

    -- jefe1 · en_gestion (1)
    ('INS-003', 'MNT-2024-003', id_jefe1, id_tec1,
     'Central fuera de línea', 'Revisión pendiente de piezas',
     'en_gestion', id_supervisor),

    -- jefe1 · rescatada (1)
    ('INS-004', 'MNT-2024-004', id_jefe1, id_tec2,
     'Batería agotada', 'Batería principal y respaldo',
     'rescatada', id_supervisor),

    -- jefe2 · pendiente (1)
    ('INS-005', 'MNT-2024-005', id_jefe2, id_tec3,
     'Presión insuficiente en BIE', null,
     'pendiente', id_supervisor),

    -- jefe2 · en_gestion (1)
    ('INS-006', 'MNT-2024-006', id_jefe2, id_tec4,
     'Rociadores obstruidos', 'Sector B-2',
     'en_gestion', id_supervisor),

    -- jefe2 · pendiente_revision (1)
    ('INS-007', 'MNT-2024-007', id_jefe2, id_tec3,
     'Señalización de emergencia deteriorada', 'Reemplazadas 4 señales',
     'pendiente_revision', id_supervisor),

    -- jefe2 · cerrada (1)
    ('INS-008', 'MNT-2024-008', id_jefe2, id_tec4,
     'Puerta RF bloqueada', 'Daño estructural irreparable',
     'cerrada', id_supervisor),

    -- jefe3 · pendiente (1)
    ('INS-009', 'MNT-2024-009', id_jefe3, id_tec5,
     'Extintor fuera de fecha', null,
     'pendiente', id_supervisor),

    -- jefe3 · pendiente_revision (1)
    ('INS-010', 'MNT-2024-010', id_jefe3, id_tec6,
     'Detector térmico sin calibrar', 'Calibrado y probado',
     'pendiente_revision', id_supervisor),

    -- jefe3 · rescatada (1)
    ('INS-011', 'MNT-2024-011', id_jefe3, id_tec5,
     'Panel de control sin comunicación', 'Módulo GSM reemplazado',
     'rescatada', id_supervisor),

    -- supervisor (como jefe_equipo) · en_gestion (1)
    ('INS-012', 'MNT-2024-012', id_supervisor, null,
     'Sistema de diluvio sin activar', 'Revisión propia del supervisor',
     'en_gestion', id_supervisor);


end $$;


-- =============================================================
-- CONSULTAS DE VERIFICACIÓN
-- Ejecutar después del seed para confirmar que todo está bien.
-- =============================================================

-- Usuarios creados
select nombre, email, rol from usuarios order by rol;

-- Técnicos con su jefe
select t.nombre as tecnico, u.nombre as jefe
from tecnicos t join usuarios u on u.id = t.jefe_id
order by u.nombre;

-- Expedientes por estado
select estado, count(*) from expedientes group by estado order by estado;

-- Distribución por jefe
select u.nombre as jefe, count(*) as total
from expedientes e join usuarios u on u.id = e.jefe_id
group by u.nombre order by u.nombre;
