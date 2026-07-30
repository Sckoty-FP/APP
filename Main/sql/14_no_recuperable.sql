-- ─────────────────────────────────────────────────────────────────────────────
-- SGR-PPA — Migración: eliminar estado "pendiente" + campo tipo en comentarios
-- Ejecutar en Supabase SQL Editor (una sola vez)
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Migrar expedientes en estado "pendiente" → "en_gestion"
UPDATE expedientes
SET estado = 'en_gestion'
WHERE estado = 'pendiente';

-- 2. Agregar columna tipo a comentarios (para identificar comentarios de cierre)
ALTER TABLE comentarios
ADD COLUMN IF NOT EXISTS tipo TEXT NOT NULL DEFAULT 'normal';

-- Verificar resultado
SELECT estado, COUNT(*) FROM expedientes GROUP BY estado ORDER BY estado;
SELECT tipo, COUNT(*) FROM comentarios GROUP BY tipo ORDER BY tipo;
