# Estado del proyecto — SGR-PPA

> Actualizar al cerrar cada sesion. Sin esto, la siguiente empieza a ciegas.

---

## Estado actual

**Fase activa:** v4 en construccion (rama `feat/v4-estadisticas`, plan en `proyecto/plan-v4.md`).
v3 completa y en produccion (main, cfb58bf, https://app-nu-eosin-14.vercel.app).
**Ultima actualizacion:** 2026-11-19

### v4 — pedidos de Ruben (ago + nov 2026)
- [x] Jefes de equipo crean expedientes (RLS en sql/15) — c86d293
- [x] Motor SQL de estadisticas con filtros (sql/16) — c5924be
- [x] Logica pura de filtros con tests (`node --test tests/unit/*.test.mjs`) — 998cbbb
- [x] Pantalla Estadisticas: filtros jefe/tecnico/periodo, acumulado, rankings, PDF filtrado — d8a6237
- [x] Revision adversarial (fable-auditor): 0 criticos/altos; 1 medio + 4 bajos arreglados (trigger proteger_campos_expediente en sql/15)
- [ ] **DUEÑO:** ejecutar sql/15 y sql/16 en Supabase SQL Editor (en ese orden)
- [ ] **DUEÑO:** probar con Ruben (admin) y test.jefe (jefe_equipo): crear expediente + estadisticas
- [ ] **DUEÑO:** merge feat/v4-estadisticas → main + push (Vercel despliega). SQL ANTES del push.
- Imagenes: ya existian (fotos en comentarios). Video: descartado (Supabase free).

### v3 (cerrada, en main)
Modulos A-G completados y commiteados (E: 95af544, F: 6b3853f). Despues (07-30): informe mensual PDF,
layout desktop con sidebar, boton instalar PWA, fixes de sesion/realtime, estado "pendiente" eliminado
+ boton No Recuperable (sql/13, sql/14).

---

## Registro Kickstart

- [x] Fase 1 — Brief escrito (`proyecto/brief.md`)
- [x] Fase 2 — Abogado del diablo completado. Veredicto: SEGUIR (`proyecto/veredicto.md`)
- [ ] Fase 3 — Negocio/rentabilidad: OMITIDA (proyecto interno, sin monetizacion)
- [x] Fase 4 — Decisiones y plan cerrados (`proyecto/decisiones.md`, `proyecto/plan.md`)

---

## Construccion del proyecto (11 fases)

| # | Fase | Estado |
|---|---|---|
| 1 | Andamiaje | ✅ Completada |
| 2 | Base de datos | ✅ Completada |
| 3 | Sistema visual | ✅ Completada |
| 4 | Auth y roles | ✅ Completada |
| 5 | CRUD expedientes | ✅ Completada — RLS verificada con 2 jefes |
| 6 | Comentarios e imagenes | ✅ Verificada con Playwright (jefe_equipo ve input, jefe_zona no) |
| 7 | Maquina de estados | ✅ Completada — BD rechaza transiciones prohibidas, verificado |
| 8 | Importacion Excel | Bloqueada (falta Excel real) |
| 9 | Busqueda y filtros | ✅ Completada — filtros combinados en URL, restauración automática |
| 10 | Dashboards | ✅ Completada — KPIs SQL (05_kpis.sql), Chart.js, inicio.html, perfil.html |
| 11 | PWA y pulido | ✅ Completada — sw.js, manifest actualizado, icons/icon.svg + generate.html |

---

## Servidor de desarrollo

Usar `http-server` en lugar de `live-server`:
```
npx http-server Main -p 3000 --cors -c-1
```
live-server rompe los fragmentos HTML inyectando scripts dentro de los <svg>.

---

## Pendientes criticos

- [ ] Confirmar que sql/10 a sql/14 estan ejecutados en Supabase (no verificable desde el repo)
- [ ] Ver checklist v4 arriba

## Usuarios de prueba (v3)

- `ruben.beltran@verisure.es` — admin_ppa (antes supervisor)
- `sergio.rey@verisure.es` — delegado (antes jefe_zona)
- `test.jefe@verisure.es` — jefe_equipo (UUID: 4410fb9b-d522-4172-b8a6-0fc069f442a5)
- `test.jefe2@verisure.es` — jefe_equipo (UUID: ec7db121-34d2-4736-bd8b-e4dd47854f2d)

---

## Deuda tecnica

- Boton de logout usa confirm() nativo — mejorar en Fase 11
- Usuarios de prueba (test.jefe*) a eliminar cuando lleguen los correos reales
