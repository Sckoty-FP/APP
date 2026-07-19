-- ============================================================
-- 07_usuarios_rls.sql
-- Políticas RLS para que el supervisor pueda gestionar usuarios.
-- Ejecutar en Supabase SQL Editor.
--
-- ANTES de ejecutar: verificar qué políticas existen sobre `usuarios`
-- con: SELECT policyname FROM pg_policies WHERE tablename = 'usuarios';
-- ============================================================

-- Eliminar políticas anteriores que puedan entrar en conflicto
DROP POLICY IF EXISTS "usuarios_self"           ON usuarios;
DROP POLICY IF EXISTS "usuarios_select_self"    ON usuarios;
DROP POLICY IF EXISTS "supervisor_lee_usuarios" ON usuarios;
DROP POLICY IF EXISTS "supervisor_inserta_usuarios"  ON usuarios;
DROP POLICY IF EXISTS "supervisor_actualiza_usuarios" ON usuarios;

-- ── SELECT ─────────────────────────────────────────────────────
-- Cada usuario ve su propio perfil.
-- El supervisor ve todos.
CREATE POLICY "usuarios_select"
  ON usuarios FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()
    OR (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'supervisor'
  );

-- ── INSERT ─────────────────────────────────────────────────────
-- Solo el supervisor puede crear usuarios nuevos.
CREATE POLICY "usuarios_insert"
  ON usuarios FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'supervisor'
  );

-- ── UPDATE ─────────────────────────────────────────────────────
-- Supervisor puede actualizar cualquier campo (rol, activo, nombre).
-- Cada usuario puede actualizar su propio perfil (nombre, email).
CREATE POLICY "usuarios_update"
  ON usuarios FOR UPDATE
  TO authenticated
  USING (
    id = auth.uid()
    OR (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'supervisor'
  )
  WITH CHECK (
    id = auth.uid()
    OR (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'supervisor'
  );
