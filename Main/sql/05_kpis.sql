-- ============================================================
-- Fase 10 — KPIs para el dashboard de estadísticas
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- Resumen por estado (respeta RLS del usuario autenticado)
CREATE OR REPLACE FUNCTION kpi_resumen()
RETURNS TABLE(
  total         bigint,
  pendiente     bigint,
  en_gestion    bigint,
  pend_revision bigint,
  rescatada     bigint,
  cerrada       bigint
)
LANGUAGE sql STABLE
AS $$
  SELECT
    COUNT(*)                                                   AS total,
    COUNT(*) FILTER (WHERE estado = 'pendiente')               AS pendiente,
    COUNT(*) FILTER (WHERE estado = 'en_gestion')              AS en_gestion,
    COUNT(*) FILTER (WHERE estado = 'pendiente_revision')      AS pend_revision,
    COUNT(*) FILTER (WHERE estado = 'rescatada')               AS rescatada,
    COUNT(*) FILTER (WHERE estado = 'cerrada')                 AS cerrada
  FROM expedientes;
$$;

-- Tendencia mensual — últimos N meses (respeta RLS)
CREATE OR REPLACE FUNCTION kpi_tendencia(meses int DEFAULT 6)
RETURNS TABLE(mes text, total bigint)
LANGUAGE sql STABLE
AS $$
  SELECT
    to_char(date_trunc('month', fecha_creacion), 'YYYY-MM') AS mes,
    COUNT(*)                                                 AS total
  FROM expedientes
  WHERE fecha_creacion >= now() - (meses || ' months')::interval
  GROUP BY date_trunc('month', fecha_creacion)
  ORDER BY date_trunc('month', fecha_creacion);
$$;

-- Permisos
GRANT EXECUTE ON FUNCTION kpi_resumen()      TO authenticated;
GRANT EXECUTE ON FUNCTION kpi_tendencia(int) TO authenticated;
