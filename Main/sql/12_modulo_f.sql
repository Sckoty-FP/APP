-- ============================================================
-- SGR-PPA v3 — Módulo F
-- Columna fecha_mantenimiento en expedientes
--
-- INSTRUCCIONES:
--   1. Ejecutar este script en Supabase SQL Editor.
--   2. Desplegar la app.
-- ============================================================

ALTER TABLE expedientes ADD COLUMN IF NOT EXISTS fecha_mantenimiento date;
