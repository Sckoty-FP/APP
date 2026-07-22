-- ============================================================
-- SGR-PPA v3 — Módulo E
-- Catálogo de motivos de fallo + migración conservadora
--
-- INSTRUCCIONES:
--   1. Ejecutar este script completo en Supabase SQL Editor.
--   2. Verificar que no hay errores.
--   3. Desplegar la app.
-- ============================================================

-- E1. Tabla de catálogo
CREATE TABLE IF NOT EXISTS motivos_fallo (
  id     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL UNIQUE,
  activo boolean NOT NULL DEFAULT true
);

-- E2. RLS
ALTER TABLE motivos_fallo ENABLE ROW LEVEL SECURITY;

-- Todos pueden leer (necesario para el select en nuevo.html)
CREATE POLICY "motivos: todos leen"
  ON motivos_fallo FOR SELECT USING (true);

-- Solo admin_ppa puede gestionar el catálogo
CREATE POLICY "motivos: admin gestiona"
  ON motivos_fallo FOR ALL
  USING (rol_actual() = 'admin_ppa')
  WITH CHECK (rol_actual() = 'admin_ppa');

-- E3. Semillas con los 9 motivos iniciales
INSERT INTO motivos_fallo (nombre) VALUES
  ('Retardos KO'),
  ('Cámaras KO'),
  ('MG KO'),
  ('No hay imágenes'),
  ('Ubicación de imágenes KO'),
  ('ZV KO'),
  ('No cumple ningún punto'),
  ('Tipo de instalación errónea'),
  ('XR en zonas de acceso')
ON CONFLICT (nombre) DO NOTHING;

-- E4. Migración conservadora: nueva columna en expedientes
-- La columna 'motivo' (text) se mantiene para registros existentes.
-- Los expedientes nuevos usan motivo_id.
ALTER TABLE expedientes
  ADD COLUMN IF NOT EXISTS motivo_id uuid REFERENCES motivos_fallo(id);

-- E5. Quitar NOT NULL de motivo (text) para que los nuevos registros
-- puedan usar solo motivo_id sin romper la constraint.
ALTER TABLE expedientes ALTER COLUMN motivo DROP NOT NULL;

CREATE INDEX IF NOT EXISTS expedientes_motivo_id_idx ON expedientes (motivo_id);
