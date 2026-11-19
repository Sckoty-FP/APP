# Plan v4 — Pedidos de Ruben (ago + nov 2026)

> Creado: 2026-11-19. Trabajo autónomo en rama `feat/v4-estadisticas` (NO en main:
> Vercel despliega main a producción automáticamente).

## Pedidos y decisión

| Pedido | Decisión |
|---|---|
| Estadísticas: Todos / por jefe / por técnico, acumulado y por meses (ago) | ✅ Núcleo de la v4 |
| Informe PDF filtrado por jefe (nov) | ✅ Sale del mismo motor de filtros |
| Ranking técnicos y errores que más se repiten, y quiénes (nov) | ✅ Sale del mismo motor de filtros |
| Jefes de equipo crean expedientes (nov) | ✅ Chico |
| Imágenes en expediente (nov) | ✅ Ya existe (fotos en comentarios). Verificado: el renombre de roles no rompió Storage (enum) |
| Video (nov) | ❌ Descartado por el dueño (Supabase free: 1 GB, 50 MB/archivo) |

**Decisión de diseño:** un solo motor de filtros (alcance × período) en SQL en vez de
tres funciones sueltas. Todas las funciones nuevas fuerzan en la BD que un
`jefe_equipo` solo vea lo suyo (no se confía en el frontend).

## Pasos (cada uno: construir → verificar → commit)

1. **Jefes de equipo crean expedientes**
   - `sql/15_jefe_crea_expedientes.sql`: política INSERT permite `jefe_equipo` solo con
     `jefe_id = auth.uid()`, `creado_por = auth.uid()` y técnico propio (o ninguno).
   - `nav.js`, `nuevo.html` (jefe fijo = él mismo), FAB en `expedientes.html`.
   - Verificación: `node --check`, parseo SQL; prueba real tras correr el SQL.
2. **SQL del motor de estadísticas** — `sql/16_estadisticas_filtros.sql`
   - `est_base(jefe, tecnico, desde, hasta)` con alcance por rol + 5 funciones:
     resumen, por mes (con acumulado), por jefe, ranking técnicos, ranking motivos (con quiénes).
   - Parcha las 4 funciones del informe mensual (13) para que respeten el rol.
   - Verificación: parseo SQL; revisión adversarial de seguridad.
3. **Lógica pura de filtros con tests** — `js/estadisticas-filtros.js` + `tests/unit/*.test.mjs`
   - período → rango de fechas, etiquetas, acumulado. TDD con `node --test`.
4. **Pantalla Estadísticas con filtros** — `views/estadisticas.html`, `js/estadisticas.js`
   - Barra: Alcance (Todos / Jefe / Técnico) + Período (Acumulado / Año / Mes).
   - KPIs, donut, gráfico por mes con línea de acumulado, ranking técnicos, ranking motivos, tabla por jefe.
5. **PDF con el filtro activo** — `js/exportacion.js`: `exportarInforme(datos, etiqueta)`.
6. **Revisión adversarial** (subagente con contexto limpio) sobre SQL + permisos.
7. **Cierre**: `estado.md`, instrucciones de despliegue.

## Lo que el dueño tiene que hacer (no lo puedo hacer yo)

1. Correr en Supabase SQL Editor: `15_jefe_crea_expedientes.sql` y `16_estadisticas_filtros.sql`.
2. Probar con `test.jefe@verisure.es` y con Ruben.
3. Merge `feat/v4-estadisticas` → `main` + push (despliega a Vercel).
   Orden: SQL primero, push después (el frontend nuevo necesita las funciones nuevas).

## Fuera de alcance (a ideas.md)

- Video en expedientes.
