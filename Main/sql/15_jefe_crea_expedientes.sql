-- ─────────────────────────────────────────────────────────────────────────────
-- SGR-PPA v4 — Los jefes de equipo pueden crear expedientes
-- Ejecutar en Supabase SQL Editor (idempotente: se puede correr dos veces)
--
-- Reglas para jefe_equipo (las valida la BD, no el frontend):
--   1. Solo a su nombre:        jefe_id    = auth.uid()
--   2. Firmado por él:          creado_por = auth.uid()
--   3. Técnico de SU equipo, o ningún técnico.
--   4. Nace en 'en_gestion' (no puede crear expedientes ya Rescatados/Cerrados).
-- admin_ppa y delegado siguen como estaban (Módulo C).
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "expedientes: admin y delegado insertan" ON expedientes;
DROP POLICY IF EXISTS "expedientes: insertar por rol"          ON expedientes;

CREATE POLICY "expedientes: insertar por rol"
  ON expedientes FOR INSERT
  WITH CHECK (
    rol_actual() IN ('admin_ppa', 'delegado')
    OR (
      rol_actual() = 'jefe_equipo'
      AND jefe_id    = auth.uid()
      AND creado_por = auth.uid()
      AND estado     = 'en_gestion'
      AND (
        tecnico_id IS NULL
        OR EXISTS (
          SELECT 1 FROM tecnicos t
          WHERE t.id = tecnico_id AND t.jefe_id = auth.uid()
        )
      )
    )
  );


-- ── UPDATE: cerrar el atajo "inserto bien y después edito" ──────────────────
-- Hallazgo de la revisión adversarial v4: la política UPDATE de 09 solo mira
-- jefe_id, así que un jefe podía insertar bien y luego cambiar el técnico por
-- uno de otro equipo, o reescribir creado_por.
-- Se resuelve con TRIGGER (no con la política) porque hay que comparar con OLD:
-- si el técnico de un expediente viejo cambió de equipo, el jefe tiene que
-- poder seguir editándolo mientras NO toque tecnico_id.
CREATE OR REPLACE FUNCTION proteger_campos_expediente()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- creado_por es histórico: nadie lo reescribe
  NEW.creado_por := OLD.creado_por;

  IF rol_actual() = 'jefe_equipo'
     AND NEW.tecnico_id IS DISTINCT FROM OLD.tecnico_id
     AND NEW.tecnico_id IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM tecnicos t
                     WHERE t.id = NEW.tecnico_id AND t.jefe_id = auth.uid())
  THEN
    RAISE EXCEPTION 'Solo podés asignar técnicos de tu equipo.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_proteger_campos_expediente ON expedientes;
CREATE TRIGGER trg_proteger_campos_expediente
  BEFORE UPDATE ON expedientes
  FOR EACH ROW EXECUTE FUNCTION proteger_campos_expediente();


-- Verificación: política INSERT nueva + trigger creado
SELECT policyname, cmd FROM pg_policies
WHERE tablename = 'expedientes' ORDER BY cmd, policyname;
SELECT tgname FROM pg_trigger WHERE tgrelid = 'expedientes'::regclass AND NOT tgisinternal;
