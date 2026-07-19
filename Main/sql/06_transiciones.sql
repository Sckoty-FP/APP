-- ============================================================
-- Fase 10b — Actualizar trigger de transiciones de estado
-- Cambios:
--   1. Rescatada y Cerrada son estados terminales: nadie puede salir de ellos.
--   2. Supervisor puede moverse libremente entre los estados no terminales.
--   3. Jefe de equipo sigue limitado a en_gestion y pendiente_revision.
-- Ejecutar en Supabase SQL Editor (CREATE OR REPLACE no requiere DROP)
-- ============================================================

CREATE OR REPLACE FUNCTION validar_transicion_estado()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  rol_usuario rol_usuario;
BEGIN
  -- Rescatada y Cerrada son terminales: nadie puede cambiar el estado una vez aquí
  IF OLD.estado IN ('rescatada', 'cerrada') THEN
    RAISE EXCEPTION 'Este expediente está % y no puede cambiar de estado.', OLD.estado;
  END IF;

  -- Jefe de equipo: solo puede poner en_gestion o pendiente_revision
  SELECT rol INTO rol_usuario FROM usuarios WHERE id = auth.uid();

  IF rol_usuario = 'jefe_equipo' THEN
    IF NEW.estado NOT IN ('en_gestion', 'pendiente_revision') THEN
      RAISE EXCEPTION 'Transición de estado no permitida para jefe_equipo: %', NEW.estado;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;
