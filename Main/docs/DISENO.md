# Sistema visual — SGR-PPA

> ⚠️ Este archivo se **genera en la Fase 3**, tras cargar la skill de diseño.
> Hasta entonces solo contiene las restricciones que el diseño debe respetar.

---

## Restricciones de partida

- **Mobile first.** Se usa con una mano, de pie, en la calle, durante la jornada.
- Menú de navegación **inferior**, 5 destinos:
  Inicio · Expedientes · Nuevo/Importar · Estadísticas · Perfil.
- Tarjetas, mucho espacio en blanco, colores suaves, botones grandes,
  tipografía clara.
- Referencias: Notion, Linear, Apple, Gmail.
- Ningún objetivo táctil por debajo de 44 px.
- Debe leerse a plena luz del sol: contraste alto en texto principal.

---

## Componentes obligatorios

- Cabecera de pantalla
- Menú inferior
- Tarjeta de expediente (listado)
- Badge de estado (5 variantes)
- Botón primario / secundario / destructivo
- Campo de texto, select, textarea
- Burbuja de comentario (propia / ajena)
- Miniatura de foto + visor a pantalla completa
- Estado vacío
- Esqueleto de carga
- Aviso / toast

---

## Los cinco estados necesitan color propio

| Estado | Uso |
|---|---|
| Pendiente | recién llegado, requiere atención |
| En gestión | en curso |
| Pendiente revisión | espera acción del supervisor |
| Rescatada | éxito |
| Cerrada | fin sin éxito |

---

## A rellenar en la Fase 3

- [ ] Paleta completa con variables CSS
- [ ] Tipografía y escala
- [ ] Escala de espaciado
- [ ] Radios y sombras
- [ ] Especificación de cada componente
