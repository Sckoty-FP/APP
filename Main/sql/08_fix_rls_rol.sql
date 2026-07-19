-- ============================================================
-- 08_fix_rls_rol.sql
-- Fix: la política usuarios_select tenía una subquery recursiva
-- sobre la misma tabla, lo que causaba un 500 en cualquier
-- consulta que leyera usuarios desde otra tabla (expedientes, etc.)
--
-- Solución: función SECURITY DEFINER mi_rol() que lee usuarios
-- sin pasar por RLS, rompiendo la recursión.
--
-- Ejecutar en Supabase SQL Editor.
-- ============================================================

-- 1. Función helper que devuelve el rol del usuario autenticado
--    SECURITY DEFINER = bypass RLS al ejecutarse (no hay recursión)
CREATE OR REPLACE FUNCTION mi_rol()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT rol FROM usuarios WHERE id = auth.uid();
$$;

-- 2. Reemplazar la política SELECT recursiva por una que usa mi_rol()
DROP POLICY IF EXISTS "usuarios_select" ON usuarios;

CREATE POLICY "usuarios_select"
  ON usuarios FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()
    OR mi_rol() = 'supervisor'
  );

-- 3. Las políticas de INSERT y UPDATE ya son correctas (usan subquery
--    solo en WITH CHECK, no en USING sobre la misma tabla), pero las
--    actualizamos también para consistencia.
DROP POLICY IF EXISTS "usuarios_insert" ON usuarios;
DROP POLICY IF EXISTS "usuarios_update" ON usuarios;

CREATE POLICY "usuarios_insert"
  ON usuarios FOR INSERT
  TO authenticated
  WITH CHECK (mi_rol() = 'supervisor');

CREATE POLICY "usuarios_update"
  ON usuarios FOR UPDATE
  TO authenticated
  USING (id = auth.uid() OR mi_rol() = 'supervisor')
  WITH CHECK (id = auth.uid() OR mi_rol() = 'supervisor');
