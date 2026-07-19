# Especificación funcional — SGR-PPA v1.0 (MVP)

> Documento funcional original, con las correcciones acordadas incorporadas.

---

## 1. Objetivo

Cuando una PPA es rechazada, la información queda dispersa y el seguimiento
depende de llamadas, mensajes o correos. La aplicación centraliza todo el
proceso de rescate en un único sitio: registrar rechazos, hacer seguimiento,
compartir observaciones, adjuntar fotografías, saber en qué estado está cada
caso y obtener estadísticas.

**No sustituye al sistema oficial de mantenimiento.** Solo gestiona las PPA
rechazadas.

---

## 2. Alcance

**Incluye:** mantenimientos PPA rechazados, seguimiento hasta su resolución,
estadísticas.

**Excluye:** instalaciones nuevas, mantenimientos normales, clientes,
facturación, agenda, gestión de técnicos como usuarios, inventario.

---

## 3. Usuarios

### Supervisor (1)
Crear expedientes manualmente · importar desde Excel · editar cualquier
expediente · comentar · subir fotos · cambiar estados · marcar Rescatada ·
marcar Cerrada · ver estadísticas · gestionar usuarios.

Es también jefe de equipo: el término medio entre los jefes de equipo y el jefe
de zona. Tiene sus propios expedientes además de ver los de todos.

### Jefe de equipo (8-10)
Ver **únicamente sus** expedientes · comentar · subir fotos · informar de
acciones realizadas · solicitar revisión.

No puede: eliminar expedientes, marcar rescatada, editar expedientes ajenos.

### Jefe de zona (1)
Solo lectura. Consulta toda la información y las estadísticas.

### Técnicos — NO son usuarios
No tienen acceso a la aplicación. Son un catálogo: el nombre de quien ejecutó
el mantenimiento, dentro del expediente. Cada técnico pertenece a un jefe de
equipo. Sirven para buscar, filtrar y para el desglose estadístico de la V2.

---

## 4. Flujo principal

```
PPA rechazada
  ↓ el supervisor importa el rechazo
Se crea el expediente (asignado a un jefe de equipo)
  ↓
El jefe recibe el caso → comenta → sube fotos → hace nuevo mantenimiento
  ↓
Solicita revisión
  ↓
El supervisor revisa → Rescatada  |  Cerrada
```

---

## 5. Estados

| Estado | Significado | Quién lo activa |
|---|---|---|
| Pendiente | Caso recién creado | automático |
| En gestión | El jefe ya está trabajando | jefe / supervisor |
| Pendiente revisión | El jefe terminó y espera respuesta | jefe / supervisor |
| Rescatada | La PPA fue aprobada | **solo supervisor** |
| Cerrada | No se consiguió rescatar | **solo supervisor** |

---

## 6. Información del expediente

**Obligatorio:** número de instalación · número de mantenimiento (único) ·
jefe de equipo · motivo del rechazo · fecha de creación · estado.

**Opcional:** técnico · observaciones iniciales · fecha de rescate ·
comentarios · fotografías.

---

## 7. Comentarios y fotografías

Cada expediente tiene un historial cronológico. Los comentarios **no se borran**.

Las fotografías **pertenecen siempre a un comentario**, nunca al expediente
directamente. Un comentario puede llevar texto, imágenes, o ambos. Así el
historial siempre se lee con sentido.

Ejemplo:

```
Supervisor  "Necesitamos fotografía de la sirena."
Jefe        "Adjunto fotografías."          [3 imágenes]
Supervisor  "Perfecto."
Jefe        "Realizado nuevo mantenimiento."
```

---

## 8. Dashboard del supervisor

**Contadores:** Pendientes · En gestión · Pendientes de revisión · Rescatadas ·
Cerradas.

**KPIs:** rescatadas este mes · casos creados este mes · tiempo medio hasta
rescate · casos abiertos más antiguos.

**Tabla por jefe:** pendientes, en gestión, pendiente revisión, rescatadas,
cerradas, % de rescate.

**Actividad reciente:** últimos comentarios, últimos casos creados, últimas PPA
rescatadas.

**Gráficos:** evolución mensual (creados / rescatados / cerrados) y distribución
circular por estado.

---

## 9. Dashboard del jefe de equipo

Sus contadores por estado · casos donde el supervisor respondió · casos
pendientes de actuación.

---

## 10. Búsqueda y filtros

**Buscador único** sobre: número de instalación, número de mantenimiento,
nombre del técnico, nombre del jefe, observaciones y motivo del rechazo.

**Filtros:** estado, jefe de equipo, técnico, rango de fechas.

---

## 11. Importación de Excel

Solo el supervisor.

```
Seleccionar archivo → Validación → Vista previa → Importar
```

Si ya existe un expediente con el mismo número de mantenimiento, se avisa antes
de importar y se puede elegir entre saltar o actualizar.

> El mapeo de columnas se define en la Fase 8, con el archivo real en la mano.

---

## 12. Notificaciones

Dentro de la aplicación. Sin push ni correo en la V1.

Ejemplos: "Tienes 4 casos pendientes" · "El supervisor comentó un expediente" ·
"Tienes 3 revisiones pendientes".

---

## 13. Pantallas

Login · Dashboard · Expedientes (listado) · Detalle de expediente ·
Nuevo expediente · Importar Excel · Estadísticas · Perfil.

---

## 14. Límites de la V1

Sin auditoría completa de cambios · sin notificaciones push o email · sin chat
en tiempo real · sin gestión multi-provincia · sin asignación automática · sin
prioridades · sin etiquetas avanzadas · sin integración con otros sistemas ·
sin gestión documental (PDF, Word) · sin app nativa (será PWA instalable).

---

## 15. Evolución futura (V2)

Catálogo de motivos de rechazo con estadísticas por motivo · notificaciones push
y email · dashboard por técnico · exportación a Excel y PDF · integración con el
sistema oficial para importar rechazos automáticamente · adjuntar documentos ·
menciones (@usuario) · historial de múltiples rechazos de una misma instalación ·
panel de administración de técnicos y jefes.
