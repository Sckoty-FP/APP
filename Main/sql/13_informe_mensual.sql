-- Módulo: Informe mensual — Fase 3
-- Ejecutar en Supabase SQL Editor
-- Filtra por COALESCE(fecha_mantenimiento, fecha_creacion::date)

-- ─────────────────────────────────────────────────────────────
-- 1. KPI resumen del mes
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION kpi_mes(p_anio INT, p_mes INT)
RETURNS TABLE(
  total         BIGINT,
  pendiente     BIGINT,
  en_gestion    BIGINT,
  pend_revision BIGINT,
  rescatada     BIGINT,
  cerrada       BIGINT
)
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT
    COUNT(*)                                                          AS total,
    COUNT(*) FILTER (WHERE estado = 'pendiente')                    AS pendiente,
    COUNT(*) FILTER (WHERE estado = 'en_gestion')                   AS en_gestion,
    COUNT(*) FILTER (WHERE estado = 'pendiente_revision')           AS pend_revision,
    COUNT(*) FILTER (WHERE estado = 'rescatada')                    AS rescatada,
    COUNT(*) FILTER (WHERE estado = 'cerrada')                      AS cerrada
  FROM expedientes
  WHERE EXTRACT(YEAR  FROM COALESCE(fecha_mantenimiento, fecha_creacion::date)) = p_anio
    AND EXTRACT(MONTH FROM COALESCE(fecha_mantenimiento, fecha_creacion::date)) = p_mes;
$$;

-- ─────────────────────────────────────────────────────────────
-- 2. KPI por jefe de equipo en el mes
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION kpi_jefes_mes(p_anio INT, p_mes INT)
RETURNS TABLE(
  jefe_nombre TEXT,
  total       BIGINT,
  rescatada   BIGINT,
  cerrada     BIGINT,
  activos     BIGINT
)
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT
    u.nombre                                                                             AS jefe_nombre,
    COUNT(e.id)                                                                          AS total,
    COUNT(e.id) FILTER (WHERE e.estado = 'rescatada')                                  AS rescatada,
    COUNT(e.id) FILTER (WHERE e.estado = 'cerrada')                                    AS cerrada,
    COUNT(e.id) FILTER (WHERE e.estado IN ('pendiente','en_gestion','pendiente_revision')) AS activos
  FROM expedientes e
  JOIN usuarios u ON u.id = e.jefe_id
  WHERE EXTRACT(YEAR  FROM COALESCE(e.fecha_mantenimiento, e.fecha_creacion::date)) = p_anio
    AND EXTRACT(MONTH FROM COALESCE(e.fecha_mantenimiento, e.fecha_creacion::date)) = p_mes
  GROUP BY u.id, u.nombre
  ORDER BY total DESC;
$$;

-- ─────────────────────────────────────────────────────────────
-- 3. KPI por motivo de fallo en el mes
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION kpi_motivos_mes(p_anio INT, p_mes INT)
RETURNS TABLE(
  motivo_nombre TEXT,
  total         BIGINT,
  rescatada     BIGINT,
  cerrada       BIGINT
)
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT
    COALESCE(mf.nombre, 'Sin motivo clasificado')                                       AS motivo_nombre,
    COUNT(e.id)                                                                          AS total,
    COUNT(e.id) FILTER (WHERE e.estado = 'rescatada')                                  AS rescatada,
    COUNT(e.id) FILTER (WHERE e.estado = 'cerrada')                                    AS cerrada
  FROM expedientes e
  LEFT JOIN motivos_fallo mf ON mf.id = e.motivo_id
  WHERE EXTRACT(YEAR  FROM COALESCE(e.fecha_mantenimiento, e.fecha_creacion::date)) = p_anio
    AND EXTRACT(MONTH FROM COALESCE(e.fecha_mantenimiento, e.fecha_creacion::date)) = p_mes
  GROUP BY mf.id, mf.nombre
  ORDER BY total DESC;
$$;

-- ─────────────────────────────────────────────────────────────
-- 4. KPI por técnico en el mes (solo expedientes con técnico asignado)
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION kpi_tecnicos_mes(p_anio INT, p_mes INT)
RETURNS TABLE(
  tecnico_nombre   TEXT,
  jefe_nombre      TEXT,
  total            BIGINT,
  rescatada        BIGINT,
  cerrada          BIGINT,
  motivo_frecuente TEXT
)
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT
    t.nombre                                                                             AS tecnico_nombre,
    u.nombre                                                                             AS jefe_nombre,
    COUNT(e.id)                                                                          AS total,
    COUNT(e.id) FILTER (WHERE e.estado = 'rescatada')                                  AS rescatada,
    COUNT(e.id) FILTER (WHERE e.estado = 'cerrada')                                    AS cerrada,
    (
      SELECT COALESCE(mf2.nombre, 'Sin motivo')
      FROM   expedientes e2
      LEFT JOIN motivos_fallo mf2 ON mf2.id = e2.motivo_id
      WHERE  e2.tecnico_id = t.id
        AND  EXTRACT(YEAR  FROM COALESCE(e2.fecha_mantenimiento, e2.fecha_creacion::date)) = p_anio
        AND  EXTRACT(MONTH FROM COALESCE(e2.fecha_mantenimiento, e2.fecha_creacion::date)) = p_mes
      GROUP  BY mf2.nombre
      ORDER  BY COUNT(*) DESC
      LIMIT  1
    )                                                                                    AS motivo_frecuente
  FROM expedientes e
  JOIN tecnicos t ON t.id = e.tecnico_id
  JOIN usuarios u ON u.id = e.jefe_id
  WHERE e.tecnico_id IS NOT NULL
    AND EXTRACT(YEAR  FROM COALESCE(e.fecha_mantenimiento, e.fecha_creacion::date)) = p_anio
    AND EXTRACT(MONTH FROM COALESCE(e.fecha_mantenimiento, e.fecha_creacion::date)) = p_mes
  GROUP BY t.id, t.nombre, u.nombre
  ORDER BY total DESC;
$$;
