-- ─────────────────────────────────────────────────────────────────────────────
-- SGR-PPA v4 — Motor de estadísticas con filtros (alcance × período)
-- Ejecutar en Supabase SQL Editor DESPUÉS de 15_jefe_crea_expedientes.sql
-- Idempotente (CREATE OR REPLACE). Se puede correr más de una vez.
--
-- Parámetros comunes de todas las funciones est_*:
--   p_jefe    uuid  → NULL = todos los jefes
--   p_tecnico uuid  → NULL = todos los técnicos
--   p_desde   date  → NULL = sin límite inferior (inclusive)
--   p_hasta   date  → NULL = sin límite superior (EXCLUSIVO: el día p_hasta no entra)
--
-- Fecha de referencia: COALESCE(fecha_mantenimiento, fecha_creacion::date),
-- la misma que el informe mensual (13).
--
-- SEGURIDAD: las funciones son SECURITY DEFINER (para poder leer nombres de
-- usuarios/técnicos), así que se saltan RLS. Por eso est_base aplica a mano la
-- misma regla que la RLS de expedientes: admin_ppa y delegado ven todo,
-- jefe_equipo solo lo suyo. Todas las demás leen SOLO a través de est_base.
-- ─────────────────────────────────────────────────────────────────────────────


-- ── 1. Base filtrada con alcance por rol ─────────────────────────────────────
CREATE OR REPLACE FUNCTION est_base(
  p_jefe uuid DEFAULT NULL, p_tecnico uuid DEFAULT NULL,
  p_desde date DEFAULT NULL, p_hasta date DEFAULT NULL
)
RETURNS SETOF expedientes
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT e.*
  FROM expedientes e
  WHERE (rol_actual() IN ('admin_ppa', 'delegado') OR e.jefe_id = auth.uid())
    AND (p_jefe    IS NULL OR e.jefe_id    = p_jefe)
    AND (p_tecnico IS NULL OR e.tecnico_id = p_tecnico)
    AND (p_desde   IS NULL OR COALESCE(e.fecha_mantenimiento, e.fecha_creacion::date) >= p_desde)
    AND (p_hasta   IS NULL OR COALESCE(e.fecha_mantenimiento, e.fecha_creacion::date) <  p_hasta);
$$;


-- ── 2. Resumen (KPIs + donut) ────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION est_resumen(
  p_jefe uuid DEFAULT NULL, p_tecnico uuid DEFAULT NULL,
  p_desde date DEFAULT NULL, p_hasta date DEFAULT NULL
)
RETURNS TABLE(total bigint, en_gestion bigint, pend_revision bigint, rescatada bigint, cerrada bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE b.estado = 'en_gestion'),
    COUNT(*) FILTER (WHERE b.estado = 'pendiente_revision'),
    COUNT(*) FILTER (WHERE b.estado = 'rescatada'),
    COUNT(*) FILTER (WHERE b.estado = 'cerrada')
  FROM est_base(p_jefe, p_tecnico, p_desde, p_hasta) b;
$$;


-- ── 3. Serie por mes con acumulado (meses sin datos aparecen en 0) ───────────
CREATE OR REPLACE FUNCTION est_por_mes(
  p_jefe uuid DEFAULT NULL, p_tecnico uuid DEFAULT NULL,
  p_desde date DEFAULT NULL, p_hasta date DEFAULT NULL
)
RETURNS TABLE(mes text, total bigint, rescatada bigint, cerrada bigint, acumulado bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  WITH b AS (
    SELECT date_trunc('month', COALESCE(x.fecha_mantenimiento, x.fecha_creacion::date))::date AS m,
           x.estado
    FROM est_base(p_jefe, p_tecnico, p_desde, p_hasta) x
  ),
  meses AS (
    SELECT generate_series(MIN(m), MAX(m), interval '1 month')::date AS m FROM b
  ),
  agg AS (
    SELECT meses.m,
           COUNT(b.m)                                    AS total,
           COUNT(b.m) FILTER (WHERE b.estado = 'rescatada') AS rescatada,
           COUNT(b.m) FILTER (WHERE b.estado = 'cerrada')   AS cerrada
    FROM meses LEFT JOIN b ON b.m = meses.m
    GROUP BY meses.m
  )
  SELECT to_char(agg.m, 'YYYY-MM'),
         agg.total, agg.rescatada, agg.cerrada,
         (SUM(agg.total) OVER (ORDER BY agg.m))::bigint
  FROM agg
  ORDER BY agg.m;
$$;


-- ── 4. Por jefe de equipo ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION est_por_jefe(
  p_jefe uuid DEFAULT NULL, p_tecnico uuid DEFAULT NULL,
  p_desde date DEFAULT NULL, p_hasta date DEFAULT NULL
)
RETURNS TABLE(jefe_id uuid, jefe_nombre text, total bigint, rescatada bigint, cerrada bigint, activos bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT u.id, u.nombre,
         COUNT(*),
         COUNT(*) FILTER (WHERE b.estado = 'rescatada'),
         COUNT(*) FILTER (WHERE b.estado = 'cerrada'),
         COUNT(*) FILTER (WHERE b.estado IN ('en_gestion', 'pendiente_revision'))
  FROM est_base(p_jefe, p_tecnico, p_desde, p_hasta) b
  JOIN usuarios u ON u.id = b.jefe_id
  GROUP BY u.id, u.nombre
  ORDER BY COUNT(*) DESC, u.nombre;
$$;


-- ── 5. Ranking de técnicos (quién más repite) ────────────────────────────────
-- jefe_nombre = jefe ACTUAL del técnico (tecnicos.jefe_id).
CREATE OR REPLACE FUNCTION est_ranking_tecnicos(
  p_jefe uuid DEFAULT NULL, p_tecnico uuid DEFAULT NULL,
  p_desde date DEFAULT NULL, p_hasta date DEFAULT NULL
)
RETURNS TABLE(
  tecnico_id uuid, tecnico_nombre text, jefe_nombre text,
  total bigint, rescatada bigint, cerrada bigint,
  motivo_frecuente text, motivo_veces bigint
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  WITH b AS (
    SELECT * FROM est_base(p_jefe, p_tecnico, p_desde, p_hasta) WHERE tecnico_id IS NOT NULL
  ),
  tm AS (
    SELECT b.tecnico_id, b.motivo_id, COUNT(*) AS n,
           ROW_NUMBER() OVER (PARTITION BY b.tecnico_id ORDER BY COUNT(*) DESC, b.motivo_id) AS rn
    FROM b GROUP BY b.tecnico_id, b.motivo_id
  )
  SELECT t.id, t.nombre, u.nombre,
         COUNT(*),
         COUNT(*) FILTER (WHERE b.estado = 'rescatada'),
         COUNT(*) FILTER (WHERE b.estado = 'cerrada'),
         (SELECT COALESCE(mf.nombre, 'Sin motivo clasificado')
            FROM tm LEFT JOIN motivos_fallo mf ON mf.id = tm.motivo_id
           WHERE tm.tecnico_id = t.id AND tm.rn = 1),
         (SELECT tm.n FROM tm WHERE tm.tecnico_id = t.id AND tm.rn = 1)
  FROM b
  JOIN tecnicos t      ON t.id = b.tecnico_id
  LEFT JOIN usuarios u ON u.id = t.jefe_id
  GROUP BY t.id, t.nombre, u.nombre
  ORDER BY COUNT(*) DESC, t.nombre;
$$;


-- ── 6. Ranking de motivos (errores que más se repiten y quiénes) ─────────────
-- tecnicos_top = los 3 técnicos que más generan ese motivo: "Juan (5), Pedro (3)"
CREATE OR REPLACE FUNCTION est_ranking_motivos(
  p_jefe uuid DEFAULT NULL, p_tecnico uuid DEFAULT NULL,
  p_desde date DEFAULT NULL, p_hasta date DEFAULT NULL
)
RETURNS TABLE(motivo_nombre text, total bigint, rescatada bigint, cerrada bigint, tecnicos_top text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  WITH b AS (
    SELECT * FROM est_base(p_jefe, p_tecnico, p_desde, p_hasta)
  ),
  m AS (
    SELECT b.motivo_id,
           COUNT(*) AS total,
           COUNT(*) FILTER (WHERE b.estado = 'rescatada') AS rescatada,
           COUNT(*) FILTER (WHERE b.estado = 'cerrada')   AS cerrada
    FROM b GROUP BY b.motivo_id
  ),
  mt AS (
    SELECT b.motivo_id, t.nombre, COUNT(*) AS n,
           ROW_NUMBER() OVER (PARTITION BY b.motivo_id ORDER BY COUNT(*) DESC, t.nombre) AS rn
    FROM b JOIN tecnicos t ON t.id = b.tecnico_id
    GROUP BY b.motivo_id, t.id, t.nombre
  )
  SELECT COALESCE(mf.nombre, 'Sin motivo clasificado'),
         m.total, m.rescatada, m.cerrada,
         (SELECT string_agg(mt.nombre || ' (' || mt.n || ')', ', ' ORDER BY mt.rn)
            FROM mt
           WHERE mt.motivo_id IS NOT DISTINCT FROM m.motivo_id AND mt.rn <= 3)
  FROM m
  LEFT JOIN motivos_fallo mf ON mf.id = m.motivo_id
  ORDER BY m.total DESC, 1;
$$;


-- ── 7. Parche de seguridad al informe mensual (13) ───────────────────────────
-- Las 4 funciones kpi_*_mes eran SECURITY DEFINER SIN filtro de rol: un
-- jefe_equipo que las llamara veía datos de TODOS. Se redefinen sobre est_base
-- (misma firma y columnas → el frontend actual sigue funcionando).
-- Cuando el frontend v4 esté desplegado ya no se usan; se pueden borrar luego.

CREATE OR REPLACE FUNCTION kpi_mes(p_anio INT, p_mes INT)
RETURNS TABLE(total BIGINT, pendiente BIGINT, en_gestion BIGINT, pend_revision BIGINT, rescatada BIGINT, cerrada BIGINT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT COUNT(*),
         COUNT(*) FILTER (WHERE b.estado = 'pendiente'),
         COUNT(*) FILTER (WHERE b.estado = 'en_gestion'),
         COUNT(*) FILTER (WHERE b.estado = 'pendiente_revision'),
         COUNT(*) FILTER (WHERE b.estado = 'rescatada'),
         COUNT(*) FILTER (WHERE b.estado = 'cerrada')
  FROM est_base(NULL, NULL, make_date(p_anio, p_mes, 1),
                (make_date(p_anio, p_mes, 1) + interval '1 month')::date) b;
$$;

CREATE OR REPLACE FUNCTION kpi_jefes_mes(p_anio INT, p_mes INT)
RETURNS TABLE(jefe_nombre TEXT, total BIGINT, rescatada BIGINT, cerrada BIGINT, activos BIGINT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT j.jefe_nombre, j.total, j.rescatada, j.cerrada, j.activos
  FROM est_por_jefe(NULL, NULL, make_date(p_anio, p_mes, 1),
                    (make_date(p_anio, p_mes, 1) + interval '1 month')::date) j;
$$;

CREATE OR REPLACE FUNCTION kpi_motivos_mes(p_anio INT, p_mes INT)
RETURNS TABLE(motivo_nombre TEXT, total BIGINT, rescatada BIGINT, cerrada BIGINT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT r.motivo_nombre, r.total, r.rescatada, r.cerrada
  FROM est_ranking_motivos(NULL, NULL, make_date(p_anio, p_mes, 1),
                           (make_date(p_anio, p_mes, 1) + interval '1 month')::date) r;
$$;

CREATE OR REPLACE FUNCTION kpi_tecnicos_mes(p_anio INT, p_mes INT)
RETURNS TABLE(tecnico_nombre TEXT, jefe_nombre TEXT, total BIGINT, rescatada BIGINT, cerrada BIGINT, motivo_frecuente TEXT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT r.tecnico_nombre, r.jefe_nombre, r.total, r.rescatada, r.cerrada, r.motivo_frecuente
  FROM est_ranking_tecnicos(NULL, NULL, make_date(p_anio, p_mes, 1),
                            (make_date(p_anio, p_mes, 1) + interval '1 month')::date) r;
$$;


-- ── 8. Permisos: solo usuarios logueados ─────────────────────────────────────
REVOKE EXECUTE ON FUNCTION est_base(uuid, uuid, date, date)             FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION est_resumen(uuid, uuid, date, date)          FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION est_por_mes(uuid, uuid, date, date)          FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION est_por_jefe(uuid, uuid, date, date)         FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION est_ranking_tecnicos(uuid, uuid, date, date) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION est_ranking_motivos(uuid, uuid, date, date)  FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION kpi_mes(int, int)          FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION kpi_jefes_mes(int, int)    FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION kpi_motivos_mes(int, int)  FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION kpi_tecnicos_mes(int, int) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION est_base(uuid, uuid, date, date)             TO authenticated;
GRANT EXECUTE ON FUNCTION est_resumen(uuid, uuid, date, date)          TO authenticated;
GRANT EXECUTE ON FUNCTION est_por_mes(uuid, uuid, date, date)          TO authenticated;
GRANT EXECUTE ON FUNCTION est_por_jefe(uuid, uuid, date, date)         TO authenticated;
GRANT EXECUTE ON FUNCTION est_ranking_tecnicos(uuid, uuid, date, date) TO authenticated;
GRANT EXECUTE ON FUNCTION est_ranking_motivos(uuid, uuid, date, date)  TO authenticated;
GRANT EXECUTE ON FUNCTION kpi_mes(int, int)          TO authenticated;
GRANT EXECUTE ON FUNCTION kpi_jefes_mes(int, int)    TO authenticated;
GRANT EXECUTE ON FUNCTION kpi_motivos_mes(int, int)  TO authenticated;
GRANT EXECUTE ON FUNCTION kpi_tecnicos_mes(int, int) TO authenticated;


-- ── Verificación (como admin en el SQL Editor auth.uid() es NULL → 0 filas;
--    eso es CORRECTO: prueba que sin usuario no se ve nada) ──────────────────
SELECT * FROM est_resumen();
