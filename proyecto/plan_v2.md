# Plan V2 — SGR-PPA

> Una fase = una sesión = un commit. No empieces una fase sin cerrar la anterior.

---

## Fases v2

| # | Nombre | Estado |
|---|---|---|
| v2/1 | Gestión de usuarios | Pendiente |
| v2/2 | Realtime + Notificaciones en-app | Pendiente |
| v2/3 | Exportación PDF | Pendiente |
| v2/4 | Importación Excel | Bloqueada (falta archivo) |

---

## v2/Fase 1 — Gestión de usuarios

**Qué entrega:** El supervisor puede crear, activar/desactivar y cambiar el rol
de usuarios desde la app. Sin ir al dashboard de Supabase.

**Qué NO hace:** Cambiar contraseñas (queda para v3), gestión de técnicos
(catálogo separado, baja prioridad).

### Archivos nuevos
- `Main/views/usuarios.html` — lista de usuarios + formulario de creación
- `Main/js/usuarios.js` — listarUsuarios, crearUsuario, toggleActivo, cambiarRol
- `Main/sql/07_usuarios_rls.sql` — nuevas políticas RLS para supervisor

### Archivos modificados
- `Main/js/router.js` — añadir ruta `#/usuarios` con guard supervisor
- `Main/views/perfil.html` — botón "Gestionar usuarios" (solo supervisor)

### No se toca
- `nav.js` — el nav se queda igual (5 tabs). Acceso desde perfil.
- `auth.js`, `app.js`, `supabase.js` — sin cambios.

### Técnica: creación de usuarios sin Edge Function
Supabase no permite crear auth users desde el cliente con la clave anon.
Solución: instancia temporal separada solo para `signUp()` — no afecta la
sesión del supervisor porque usa su propio almacén de tokens.

```js
// usuarios.js
async function crearUsuarioAuth(email, password) {
  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
  const tmp = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data, error } = await tmp.auth.signUp({ email, password });
  if (error) throw error;
  return data.user.id;
}
```

**Prerequisito:** En Supabase > Authentication > Settings, "Confirm email"
debe estar DESACTIVADO para que el usuario quede activo al instante.

### SQL necesario (07_usuarios_rls.sql)
```sql
-- Supervisor puede leer todos los usuarios
CREATE POLICY "supervisor_lee_usuarios"
  ON usuarios FOR SELECT
  TO authenticated
  USING (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'supervisor'
    OR id = auth.uid()
  );

-- Supervisor puede insertar nuevos usuarios
CREATE POLICY "supervisor_inserta_usuarios"
  ON usuarios FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'supervisor'
  );

-- Supervisor puede actualizar rol y activo
CREATE POLICY "supervisor_actualiza_usuarios"
  ON usuarios FOR UPDATE
  TO authenticated
  USING (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'supervisor'
  )
  WITH CHECK (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'supervisor'
  );
```

### Verificación de cierre
- Como supervisor: crear usuario, listarlo, desactivarlo, reactivarlo.
- Como jefe_equipo: NO puede ver la lista de usuarios (RLS).
- Nuevo usuario puede loguearse con las credenciales creadas.

---

## v2/Fase 2 — Realtime + Notificaciones en-app

**Qué entrega:** Cuando llega un comentario nuevo en un expediente, aparece
una notificación (badge en el header). Al abrir el expediente, se limpia.
No persiste entre sesiones (v2) — el contador se resetea al recargar.

### Archivos nuevos
- `Main/js/notificaciones.js` — subscribe/unsubscribe, contador en memoria,
  evento CustomEvent para que el header se actualice

### Archivos modificados
- `Main/css/app.css` — estilos badge notificaciones en header
- `Main/js/auth.js` — inicializar suscripción al hacer login, limpiar al logout
- `Main/views/expediente.html` — limpiar notificaciones del expediente al abrirlo

### Técnica
```js
// notificaciones.js
import { getSupabase } from './supabase.js';

let _count = 0;
let _channel = null;

export function iniciarNotificaciones() {
  const sb = getSupabase();
  _channel = sb
    .channel('comentarios-nuevos')
    .on('postgres_changes', {
      event: 'INSERT', schema: 'public', table: 'comentarios'
    }, payload => {
      _count++;
      document.dispatchEvent(new CustomEvent('notif:update', { detail: _count }));
    })
    .subscribe();
}

export function limpiarNotificaciones() {
  _count = 0;
  document.dispatchEvent(new CustomEvent('notif:update', { detail: 0 }));
}

export function detenerNotificaciones() {
  _channel?.unsubscribe();
  _count = 0;
}
```

RLS en Realtime: Supabase filtra automáticamente los eventos que el usuario
no tiene acceso a leer. El jefe_equipo solo recibe comentarios de sus expedientes.

### Verificación de cierre
- Dos sesiones abiertas: supervisor y jefe_equipo en el mismo expediente.
- Supervisor pone comentario → jefe_equipo ve badge inmediato, sin recargar.
- Al abrir el expediente, el badge desaparece.

---

## v2/Fase 3 — Exportación PDF

**Qué entrega:** Botón "Exportar PDF" en la vista de expedientes que genera
una tabla con los expedientes visibles (aplicando los filtros activos).
También botón en estadísticas para exportar KPIs como resumen de texto.

**Qué NO hace:** Exportar gráficas (requeriría html2canvas, +300KB, queda v3).

### Archivos nuevos
- `Main/js/exportacion.js` — generarPDFExpedientes(expedientes), generarPDFKPIs(kpis)

### Archivos modificados
- `Main/views/expedientes.html` — botón "Exportar" (visible para supervisor y jefe_zona)
- `Main/views/estadisticas.html` — botón "Exportar resumen"
- `Main/css/app.css` — estilos botón export si se necesitan

### Técnica
jsPDF cargado dinámicamente solo cuando el usuario pulsa el botón:
```js
async function cargarJsPDF() {
  if (window.jspdf) return window.jspdf.jsPDF;
  await import('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
  return window.jspdf.jsPDF;
}
```

### Verificación de cierre
- Con 3+ expedientes filtrados: clic en Exportar → PDF descargado con la tabla.
- PDF tiene cabecera con nombre del proyecto, fecha de generación y filtros activos.

---

## v2/Fase 4 — Importación Excel (bloqueada)

**Desbloquea cuando:** llegue el archivo Excel real de exportación del sistema de mantenimiento.

**Plan tentativo:**
- SheetJS (ya planeado en v1) para leer el archivo
- Mapeo de columnas: instalación, nº mantenimiento, jefe asignado, fecha
- Import idempotente: `upsert` por `mantenimiento` (único) — reimportar no duplica
- Progreso visual: barra mientras procesa las filas

---

## Decisiones tomadas

| Decisión | Razón |
|---|---|
| No Edge Functions en v2/Fase 1 | Evita nueva infraestructura; instancia tmp de Supabase es suficiente |
| Nav sin cambios en v2/Fase 1 | Gestión de usuarios es acción infrecuente; acceso desde perfil es correcto |
| Notificaciones en memoria (sin tabla) | Suficiente para v2; persistencia real es v3 |
| jsPDF sin html2canvas | +300KB y complejidad para gráficas; tabla de texto cubre el 80% del valor |
| App nativa (iOS/Android) → no en v2 | PWA ya instalable; app nativa es v3 si los usuarios la piden |
