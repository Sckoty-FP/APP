# Estado del proyecto — SGR-PPA

> Actualizar al cerrar cada sesion. Sin esto, la siguiente empieza a ciegas.

---

## Estado actual

**Fase activa:** v2 completada (Fases 1-3). v2/4 Excel bloqueada esperando archivo.
**Ultima actualizacion:** 2026-07-19

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

- [ ] Conseguir el Excel real de importacion (desbloquea Fase 8)
- [ ] Ejecutar Main/sql/05_kpis.sql en Supabase SQL Editor (desbloquea estadísticas)
- [ ] Generar iconos PNG: abrir Main/icons/generate.html en el navegador y guardar los archivos en Main/icons/
- [ ] Emails de jefes de equipo reales

---

## Usuarios de prueba en BD

- `ruben.beltran@verisure.es` — supervisor (real)
- `sergio.rey@verisure.es` — jefe_zona (real)
- `test.jefe@verisure.es` — jefe_equipo (prueba, UUID: 4410fb9b-d522-4172-b8a6-0fc069f442a5)
- `test.jefe2@verisure.es` — jefe_equipo (prueba, UUID: ec7db121-34d2-4736-bd8b-e4dd47854f2d)

---

## Deuda tecnica

- Boton de logout usa confirm() nativo — mejorar en Fase 11
- Usuarios de prueba (test.jefe*) a eliminar cuando lleguen los correos reales
