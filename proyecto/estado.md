# Estado del proyecto — SGR-PPA

> Actualizar al cerrar cada sesion. Sin esto, la siguiente empieza a ciegas.

---

## Estado actual

**Fase activa:** v3 en construccion — Modulos A, B, C, G completados. D completado (codigo). E y F pendientes.
**Ultima actualizacion:** 2026-07-22

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

- [ ] Ejecutar Main/sql/10_modulo_d.sql en Supabase SQL Editor (agrega columna matricula a tecnicos y usuarios)
- [ ] Modulo E: tabla motivos_fallo + cambiar motivo a select en nuevo.html
- [ ] Modulo F: importacion Excel rediseñada (depende de D y E)
- [ ] Usuarios de prueba actualizados: ruben.beltran=admin_ppa, sergio.rey=delegado (v3)

## Usuarios de prueba (v3)

- `ruben.beltran@verisure.es` — admin_ppa (antes supervisor)
- `sergio.rey@verisure.es` — delegado (antes jefe_zona)
- `test.jefe@verisure.es` — jefe_equipo (UUID: 4410fb9b-d522-4172-b8a6-0fc069f442a5)
- `test.jefe2@verisure.es` — jefe_equipo (UUID: ec7db121-34d2-4736-bd8b-e4dd47854f2d)

---

## Deuda tecnica

- Boton de logout usa confirm() nativo — mejorar en Fase 11
- Usuarios de prueba (test.jefe*) a eliminar cuando lleguen los correos reales
