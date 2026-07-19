# Plan de construcción — SGR-PPA

Una fase = una sesión = un commit.
Cada fase abre con su prompt, cierra con su checklist y actualiza `ESTADO.md`.

---

## Fase 1 — Andamiaje

**Prompt de arranque**

> Lee `CLAUDE.md` y `docs/FASES.md`. Vamos a hacer solo la Fase 1.
> Monta la estructura de carpetas, Tailwind, el cliente de Supabase, un router
> simple por hash y el layout móvil con menú inferior. Sin lógica de negocio,
> sin consultas a BD. Pantallas vacías con su título.

Estructura esperada:

```
index.html
manifest.json
css/
js/
  supabase.js
  router.js
  auth.js
  ui/
views/
docs/
sql/
```

**Cierre:** la app arranca, el menú inferior navega entre 5 pantallas vacías.

---

## Fase 2 — Base de datos

**Prompt de arranque**

> Fase 2. Lee `docs/ESQUEMA.md` y genera `sql/01_esquema.sql` con tipos, tablas,
> índices, triggers y **todas las políticas RLS**. Añade `sql/02_semillas.sql`
> con 1 jefe_zona, 1 supervisor, 3 jefes_equipo, 6 técnicos y 12 expedientes
> repartidos entre estados. No toques el frontend.

**Cierre:** las migraciones corren limpias en Supabase. Consultas de prueba
desde el SQL editor devuelven lo esperado.

---

## Fase 3 — Sistema visual (carga de la skill)

> Esta fase existe para que el diseño se decida **antes** de construir pantallas
> reales, no después.

**Prompt de arranque**

> Fase 3. Voy a activar mi skill de diseño. Cuando la leas, genera
> `docs/DISENO.md` con: paleta, tipografía, escala de espaciado, radios,
> sombras, y los componentes base (tarjeta, badge de estado, botón, input,
> menú inferior, cabecera). Implementa esos componentes en `css/` + `js/ui/` y
> deja una pantalla `views/estilos.html` que los muestre todos juntos.
> Los cinco estados necesitan cada uno su color distintivo.

**Cierre:** existe `docs/DISENO.md`, la pantalla de estilos se ve bien en móvil,
y a partir de aquí ninguna pantalla inventa estilos nuevos.

---

## Fase 4 — Auth y roles

**Prompt de arranque**

> Fase 4. Login con Supabase Auth, sesión persistente, carga del perfil desde
> `usuarios`, guard de rutas por rol y redirección según rol tras el login.
> Usa los componentes de `docs/DISENO.md`.

**Cierre:** entras con los tres usuarios de prueba y cada uno aterriza donde debe.

---

## Fase 5 — CRUD de expedientes

**Prompt de arranque**

> Fase 5. Listado de expedientes, detalle, crear y editar. El formulario pide
> primero el jefe de equipo (obligatorio); el desplegable de técnicos se filtra
> por el jefe elegido y el técnico es opcional.

**Cierre crítico:** entra como `jefe_equipo` y comprueba que **no** ve ni un
solo expediente ajeno. Si los ve, la RLS está mal y no se sigue adelante.

---

## Fase 6 — Comentarios e imágenes

**Prompt de arranque**

> Fase 6. Historial cronológico de comentarios por expediente, con adjunto de
> fotos desde la cámara del móvil. Comprime en cliente antes de subir
> (máx 1600 px, calidad 0.8). Las imágenes cuelgan del comentario. Nada se borra.

**Cierre:** subes 3 fotos desde el móvil y el historial se lee con sentido.

---

## Fase 7 — Máquina de estados

**Prompt de arranque**

> Fase 7. Transiciones de estado según rol. `jefe_equipo` solo puede pasar a
> `en_gestion` y `pendiente_revision`. `supervisor` puede todo, y al marcar
> `rescatada` se rellena `fecha_rescate` por trigger. Cada cambio de estado
> genera una notificación en app para la otra parte.

**Cierre:** intentar una transición prohibida desde la consola falla en la BD,
no solo en la interfaz.

---

## Fase 8 — Importación de Excel

> **⚠️ ANTES DE ESTA FASE: consigue el Excel real.**
>
> Necesitas la cabecera exacta del archivo que te entregan. Sin eso, cualquier
> mapeo es una suposición. Pide un archivo de ejemplo con 5-10 filas reales.
>
> Las preguntas a responder:
> - ¿Nombre exacto de cada columna?
> - ¿Viene el jefe de equipo, o solo el técnico? (si solo viene el técnico, hay
>   que deducir el jefe desde la tabla `tecnicos`)
> - ¿Los nombres coinciden literalmente con los de la BD?
> - ¿En qué formato viene la fecha?
> - ¿Hay filas de cabecera o totales que haya que saltar?

**Prompt de arranque**

> Fase 8. Importación con SheetJS. Adjunto el Excel real. Flujo:
> seleccionar archivo → validar → vista previa con errores marcados en rojo →
> importar. Avisa de duplicados por `mantenimiento` y deja elegir si se saltan
> o se actualizan. Solo accesible para `supervisor`.

**Cierre:** importas el archivo real completo en menos de 2 minutos.

---

## Fase 9 — Búsqueda y filtros

**Prompt de arranque**

> Fase 9. Buscador único sobre instalación, mantenimiento, técnico, jefe,
> observaciones y motivo. Filtros por estado, jefe, técnico y rango de fechas.
> Los filtros se combinan y quedan en la URL para poder compartirlos.

---

## Fase 10 — Dashboards y estadísticas

**Prompt de arranque**

> Fase 10. Vistas SQL o funciones RPC para los KPIs (nunca cálculo en cliente).
> Dashboard de supervisor: contadores por estado, rescatadas del mes, tiempo
> medio hasta rescate, casos abiertos más antiguos, tabla por jefe con % de
> rescate, actividad reciente, gráfico mensual y circular por estado.
> Dashboard de jefe: sus contadores, casos con respuesta del supervisor y casos
> pendientes de actuación. Chart.js encima.

---

## Fase 11 — PWA y pulido

**Prompt de arranque**

> Fase 11. Manifest, iconos, service worker con caché del shell, estados vacíos,
> esqueletos de carga, gestión de errores de red y pantalla de "sin conexión".
> Revisión final de accesibilidad táctil: nada por debajo de 44 px.

**Cierre:** se instala en el móvil desde Chrome y se usa una jornada completa
sin fricción.

---

## Criterios de éxito del proyecto

- Importar los rechazos en menos de 2 minutos.
- Cada jefe ve solo lo suyo y sabe qué debe hacer.
- Toda la comunicación centralizada en el expediente.
- El estado de cualquier PPA se conoce en segundos.
- Estadísticas en tiempo real.
- Cómoda de usar desde el móvil toda la jornada.
