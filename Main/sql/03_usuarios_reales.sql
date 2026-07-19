-- =============================================================
-- SGR-PPA · Usuarios reales
-- =============================================================
-- PASO 1: Crear los usuarios en Supabase Auth
--   Dashboard → Authentication → Users → Add user
--   Activar "Auto Confirm User"
--
-- Usuarios a crear:
--
--   Email                        Nombre           Rol
--   ─────────────────────────────────────────────────────────
--   ruben.beltran@verisure.es    Ruben Beltran    supervisor
--   sergio.rey@verisure.es       Sergio Rey       jefe_zona
--   (más jefes de equipo cuando se tengan los correos)
--
-- PASO 2: Copiar los UUIDs que asignó Supabase y reemplazarlos abajo.
-- PASO 3: Ejecutar este script en el SQL Editor.
-- =============================================================


do $$
declare
  -- Reemplazar con los UUIDs reales de Supabase Auth
  id_ruben  uuid := 'REEMPLAZAR-CON-UUID-DE-RUBEN';
  id_sergio uuid := 'REEMPLAZAR-CON-UUID-DE-SERGIO';
begin

  insert into usuarios (id, nombre, email, rol)
  values
    (id_ruben,  'Ruben Beltran', 'ruben.beltran@verisure.es', 'supervisor'),
    (id_sergio, 'Sergio Rey',    'sergio.rey@verisure.es',    'jefe_zona')
  on conflict (id) do update
    set nombre = excluded.nombre,
        email  = excluded.email,
        rol    = excluded.rol;

  raise notice 'Usuarios insertados correctamente.';
end $$;


-- Verificación
select nombre, email, rol, activo from usuarios order by rol;


-- =============================================================
-- PARA AÑADIR JEFES DE EQUIPO CUANDO TENGAS LOS CORREOS:
-- Crear el usuario en Auth, copiar su UUID y ejecutar:
--
--   insert into usuarios (id, nombre, email, rol) values
--     ('UUID-DEL-JEFE', 'Nombre Apellido', 'correo@verisure.es', 'jefe_equipo');
-- =============================================================
