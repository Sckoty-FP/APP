-- ============================================================
-- SGR-PPA v3 — Módulo D
-- Matrículas en técnicos y usuarios + RLS para técnicos
--
-- INSTRUCCIONES:
--   1. Ejecutar este script completo en Supabase SQL Editor.
--   2. Verificar que no hay errores.
--   3. Desplegar la app.
-- ============================================================

-- D1. Agregar matrícula a técnicos
ALTER TABLE tecnicos ADD COLUMN IF NOT EXISTS matricula text UNIQUE;

-- D2. Agregar matrícula a usuarios (para mapear JDE del Excel)
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS matricula text UNIQUE;

-- D3. Índices para búsqueda rápida en importación
CREATE INDEX IF NOT EXISTS tecnicos_matricula_idx ON tecnicos (matricula);
CREATE INDEX IF NOT EXISTS usuarios_matricula_idx ON usuarios (matricula);
