-- ============================================================
-- SGR-PPA v3 — Módulos A y C
-- Renombrar roles + permisos del delegado
--
-- INSTRUCCIONES:
--   1. Ejecutar este script completo en Supabase SQL Editor.
--   2. Verificar que no hay errores.
--   3. Hacer deploy de la app a Vercel inmediatamente después.
--
-- AVISO: entre ejecutar el SQL y el deploy, la app puede
-- mostrar errores de sesión para usuarios logueados.
-- Se recomienda hacer esto fuera de horario laboral.
-- ============================================================


-- ── Paso 1: Eliminar todas las políticas que usan los valores viejos ──

DROP POLICY IF EXISTS "usuarios: supervisor gestiona" ON usuarios;
DROP POLICY IF EXISTS "tecnicos: supervisor gestiona" ON tecnicos;
DROP POLICY IF EXISTS "expedientes: lectura por rol" ON expedientes;
DROP POLICY IF EXISTS "expedientes: supervisor inserta" ON expedientes;
DROP POLICY IF EXISTS "expedientes: actualizar por rol" ON expedientes;
DROP POLICY IF EXISTS "expedientes: supervisor elimina" ON expedientes;
DROP POLICY IF EXISTS "comentarios: lectura por rol" ON comentarios;
DROP POLICY IF EXISTS "comentarios: insertar por rol" ON comentarios;
DROP POLICY IF EXISTS "imagenes: lectura por rol" ON imagenes;
DROP POLICY IF EXISTS "imagenes: insertar por rol" ON imagenes;
DROP POLICY IF EXISTS "notificaciones: supervisor inserta" ON notificaciones;


-- ── Paso 2: Renombrar los valores del enum ────────────────────────────

ALTER TYPE rol_usuario RENAME VALUE 'jefe_zona'  TO 'delegado';
ALTER TYPE rol_usuario RENAME VALUE 'supervisor'  TO 'admin_ppa';


-- ── Paso 3: Actualizar metadatos de auth.users ────────────────────────
-- (Necesario para que la sesión activa del usuario refleje el nuevo rol)

UPDATE auth.users
SET raw_user_meta_data = jsonb_set(raw_user_meta_data, '{rol}', '"delegado"')
WHERE raw_user_meta_data->>'rol' = 'jefe_zona';

UPDATE auth.users
SET raw_user_meta_data = jsonb_set(raw_user_meta_data, '{rol}', '"admin_ppa"')
WHERE raw_user_meta_data->>'rol' = 'supervisor';


-- ── Paso 4: Recrear todas las políticas con los nuevos nombres ────────

-- usuarios: admin_ppa gestiona
CREATE POLICY "usuarios: admin_ppa gestiona"
  ON usuarios FOR ALL
  USING (rol_actual() = 'admin_ppa')
  WITH CHECK (rol_actual() = 'admin_ppa');

-- tecnicos: admin_ppa gestiona
CREATE POLICY "tecnicos: admin_ppa gestiona"
  ON tecnicos FOR ALL
  USING (rol_actual() = 'admin_ppa')
  WITH CHECK (rol_actual() = 'admin_ppa');

-- expedientes: lectura — delegado y admin_ppa ven todo; jefe_equipo solo los suyos
CREATE POLICY "expedientes: lectura por rol"
  ON expedientes FOR SELECT
  USING (
    rol_actual() IN ('delegado', 'admin_ppa')
    OR jefe_id = auth.uid()
  );

-- expedientes: insert — Módulo C (delegado ahora puede crear expedientes)
CREATE POLICY "expedientes: admin y delegado insertan"
  ON expedientes FOR INSERT
  WITH CHECK (rol_actual() IN ('admin_ppa', 'delegado'));

-- expedientes: update — admin_ppa libre; jefe_equipo solo los suyos
CREATE POLICY "expedientes: actualizar por rol"
  ON expedientes FOR UPDATE
  USING (
    rol_actual() = 'admin_ppa'
    OR (rol_actual() = 'jefe_equipo' AND jefe_id = auth.uid())
  )
  WITH CHECK (
    rol_actual() = 'admin_ppa'
    OR (rol_actual() = 'jefe_equipo' AND jefe_id = auth.uid())
  );

-- expedientes: delete — solo admin_ppa
CREATE POLICY "expedientes: admin elimina"
  ON expedientes FOR DELETE
  USING (rol_actual() = 'admin_ppa');

-- comentarios: lectura
CREATE POLICY "comentarios: lectura por rol"
  ON comentarios FOR SELECT
  USING (
    rol_actual() IN ('delegado', 'admin_ppa')
    OR EXISTS (
      SELECT 1 FROM expedientes e
      WHERE e.id = expediente_id AND e.jefe_id = auth.uid()
    )
  );

-- comentarios: insertar — admin_ppa y jefe_equipo (en sus expedientes)
CREATE POLICY "comentarios: insertar por rol"
  ON comentarios FOR INSERT
  WITH CHECK (
    rol_actual() = 'admin_ppa'
    OR (
      rol_actual() = 'jefe_equipo'
      AND EXISTS (
        SELECT 1 FROM expedientes e
        WHERE e.id = expediente_id AND e.jefe_id = auth.uid()
      )
    )
  );

-- imagenes: lectura
CREATE POLICY "imagenes: lectura por rol"
  ON imagenes FOR SELECT
  USING (
    rol_actual() IN ('delegado', 'admin_ppa')
    OR EXISTS (
      SELECT 1 FROM comentarios c
        JOIN expedientes e ON e.id = c.expediente_id
      WHERE c.id = comentario_id AND e.jefe_id = auth.uid()
    )
  );

-- imagenes: insertar
CREATE POLICY "imagenes: insertar por rol"
  ON imagenes FOR INSERT
  WITH CHECK (
    rol_actual() = 'admin_ppa'
    OR (
      rol_actual() = 'jefe_equipo'
      AND EXISTS (
        SELECT 1 FROM comentarios c
          JOIN expedientes e ON e.id = c.expediente_id
        WHERE c.id = comentario_id AND e.jefe_id = auth.uid()
      )
    )
  );

-- notificaciones: insertar
CREATE POLICY "notificaciones: admin_ppa inserta"
  ON notificaciones FOR INSERT
  WITH CHECK (rol_actual() = 'admin_ppa');


-- ── Verificación ──────────────────────────────────────────────────────
-- Ejecutar esto al final para confirmar que no quedan referencias viejas:

SELECT policyname, tablename, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND (
    qual      LIKE '%jefe_zona%' OR qual      LIKE '%''supervisor''%'
    OR with_check LIKE '%jefe_zona%' OR with_check LIKE '%''supervisor''%'
  );

-- Resultado esperado: 0 filas.
