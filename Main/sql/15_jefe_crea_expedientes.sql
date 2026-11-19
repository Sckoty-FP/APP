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

-- Verificación: debe listar la política nueva con cmd = INSERT
SELECT policyname, cmd FROM pg_policies
WHERE tablename = 'expedientes' ORDER BY cmd, policyname;
