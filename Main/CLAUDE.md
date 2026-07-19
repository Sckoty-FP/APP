# SGR-PPA — Sistema de Gestión de Rescate de PPA

Aplicación web móvil (PWA) para gestionar **exclusivamente** las PPA rechazadas
hasta su rescate o cierre.

---

## 1. Regla de oro

**No generes la aplicación completa.** Se construye por fases.
Una fase = una sesión = un commit. No empieces una fase sin cerrar la anterior.

El plan de fases está en `docs/FASES.md`.
Al terminar cada fase, **actualiza `docs/ESTADO.md`** antes de cerrar la sesión.

---

## 2. Qué hace y qué NO hace

**Sí:** registrar rechazos de PPA, seguimiento, comentarios, fotos, estados,
estadísticas de rescate.

**No:** instalaciones nuevas, mantenimientos normales, clientes, facturación,
agenda, inventario. No sustituye al sistema oficial de mantenimiento.

---

## 3. Roles (los tres entran a la app)

| Rol | Acceso | Puede |
|---|---|---|
| `jefe_zona` | Todo | Solo lectura. Consulta expedientes y estadísticas. |
| `supervisor` | Todo | Crear, importar Excel, editar, comentar, cambiar estado, marcar Rescatada/Cerrada, gestionar usuarios. |
| `jefe_equipo` | Solo lo suyo | Ver **sus** expedientes, comentar, subir fotos, solicitar revisión. |

**Los técnicos NO son usuarios.** No tienen acceso, ni email, ni contraseña.
Son un catálogo: un nombre dentro del expediente para buscar y filtrar.
Cada técnico pertenece a **un** jefe de equipo.

**El eje del sistema es el jefe de equipo.** Los mantenimientos se asignan al
jefe; el técnico es un dato descriptivo secundario y opcional.

---

## 4. Estados (solo cinco)

```
Pendiente → En gestión → Pendiente revisión → Rescatada
                                            ↘ Cerrada
```

- **Pendiente** — caso recién creado.
- **En gestión** — el jefe ya está trabajando.
- **Pendiente revisión** — el jefe terminó y espera respuesta.
- **Rescatada** — la PPA fue aprobada. Escribe `fecha_rescate` automáticamente.
- **Cerrada** — no se consiguió rescatar.

Solo el `supervisor` puede marcar Rescatada o Cerrada.

---

## 5. Stack

| Capa | Tecnología |
|---|---|
| Frontend | HTML + Tailwind CSS + JavaScript vanilla |
| Backend | Supabase |
| BD | PostgreSQL (con RLS) |
| Auth | Supabase Auth |
| Imágenes | Supabase Storage |
| Gráficos | Chart.js |
| Excel | SheetJS |
| Distribución | PWA instalable (manifest + service worker) |

**Sin frameworks.** Vanilla JS salvo que haya una razón concreta y se justifique.

---

## 6. Convenciones de código

- Nombres de tablas, columnas y variables de dominio **en español**
  (`expedientes`, `jefe_id`, `fecha_rescate`).
- Palabras clave de código en inglés (`async`, `const`, `function`).
- Un módulo JS por dominio: `auth.js`, `expedientes.js`, `comentarios.js`,
  `importacion.js`, `estadisticas.js`.
- Cliente Supabase centralizado en `js/supabase.js`. Nunca instanciarlo dos veces.
- Toda consulta a BD pasa por su módulo de dominio, nunca desde la vista.
- Los KPIs se calculan en **SQL** (vistas o funciones RPC), no en el cliente.

---

## 7. Seguridad

- **RLS activa en todas las tablas desde el primer día.** No se pospone.
- Nunca confiar en el rol que dice el frontend: la BD es la que decide.
- El frontend oculta botones por comodidad, no por seguridad.
- Antes de cerrar cada fase con datos: entrar como `jefe_equipo` y comprobar
  que **no** ve expedientes ajenos.

---

## 8. Documentación del proyecto

| Archivo | Contenido |
|---|---|
| `docs/FUNCIONAL.md` | Especificación funcional completa |
| `docs/ESQUEMA.md` | Modelo de datos y políticas RLS |
| `docs/FASES.md` | Plan de construcción por fases |
| `docs/ESTADO.md` | Bitácora. Se actualiza al cerrar cada fase |
| `docs/DISENO.md` | Sistema visual. Se rellena en la Fase 3 |

---

## 9. Decisiones ya tomadas (no volver a abrir)

1. `jefes_equipo` **no existe** como tabla. Los jefes viven en `usuarios`.
2. `expedientes.jefe_id` es **obligatorio** y apunta a `usuarios.id`.
3. `expedientes.tecnico_id` es **opcional** y apunta a `tecnicos.id`.
4. `jefe_id` se **copia** al expediente al crearlo. No se deduce al vuelo desde
   `tecnicos`, para que un cambio de equipo no reescriba el historial.
5. Toda fotografía pertenece a un comentario. No hay fotos sueltas en el
   expediente (un comentario puede tener imágenes sin texto).
6. Los comentarios **no se borran** nunca.
7. `mantenimiento` es único: evita duplicados al importar.
8. Notificaciones **en la app**, nunca push ni email en la V1.
