# Sistema visual — SGR-PPA

> Generado en la Fase 3. A partir de aquí ninguna pantalla inventa estilos nuevos.
> Todos los tokens viven en `css/app.css` como variables CSS.
> Pantalla de referencia: `views/estilos.html` (ruta `#/estilos`).

---

## Restricciones respetadas

- Mobile first. Una mano, de pie, en la calle.
- Menú inferior, 5 destinos: Inicio · Expedientes · Nuevo · Estadísticas · Perfil.
- Ningún objetivo táctil por debajo de 44px.
- Contraste WCAG AA en texto principal (#0F172A sobre #FFFFFF: ratio 19:1).
- Referencias: Notion, Linear, Apple, Gmail.

---

## Dirección de diseño

**Precision Field** — herramienta de campo de uso profesional. Limpieza
quirúrgica al servicio de la velocidad. Los cinco estados son los protagonistas
visuales: identificables de un vistazo mediante el borde izquierdo de la
tarjeta y el badge de color.

---

## Tipografía

Fuente: **Sora** (Google Fonts). Geométrica y técnica. Legible en pantallas
pequeñas y a plena luz del sol.

| Variable | px | Uso |
|---|---|---|
| --text-xs | 11px | Metadatos, labels uppercase, badges |
| --text-sm | 13px | Texto secundario, botones sm |
| --text-base | 15px | Cuerpo principal |
| --text-lg | 17px | Títulos de pantalla (header) |
| --text-xl | 20px | Números grandes (dashboard) |
| --text-2xl | 24px | KPIs destacados |

Pesos: 400 regular · 500 medium · 600 semibold · 700 bold.

---

## Paleta

### Base
```
--bg:             #F7F8FA   fondo de pantalla
--surface:        #FFFFFF   tarjetas, inputs, nav
--border:         #E8EAF0   bordes normales
--border-strong:  #CDD1DA   bordes de inputs en reposo
```

### Texto
```
--text-primary:   #0F172A   (ratio 19:1 sobre blanco — WCAG AAA)
--text-secondary: #64748B
--text-tertiary:  #94A3B8   metadatos, placeholders
--text-inverse:   #FFFFFF
```

### Brand
```
--brand:       #2563EB   botones primarios, nav activo, focus
--brand-dark:  #1D4ED8   hover
--brand-light: #EFF6FF   fondos suaves
```

### Estados de expediente

| Estado | Accent | Fondo badge | Texto badge |
|---|---|---|---|
| pendiente | #F59E0B | #FEF3C7 | #92400E |
| en_gestion | #3B82F6 | #DBEAFE | #1E40AF |
| pendiente_revision | #A855F7 | #F3E8FF | #6B21A8 |
| rescatada | #10B981 | #D1FAE5 | #065F46 |
| cerrada | #94A3B8 | #F1F5F9 | #475569 |

El `accent` se usa como borde izquierdo de tarjeta y punto del badge.

---

## Espaciado

Base 4px. Variables: `--s1` (4) · `--s2` (8) · `--s3` (12) · `--s4` (16) ·
`--s5` (20) · `--s6` (24) · `--s8` (32) · `--s10` (40).

---

## Radios y sombras

```
--r-sm:   6px    botones sm
--r-md:  10px    inputs, botones
--r-lg:  14px    tarjetas, toasts
--r-xl:  20px    icono vacío
--r-full: 999px  badges, puntos

--shadow-card: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)
--shadow-md:   0 4px 12px rgba(0,0,0,0.08)
--shadow-lg:   0 10px 30px rgba(0,0,0,0.12)
```

---

## Especificación de componentes

### Badge de estado
`.badge .badge-{estado}` — píldora con punto de color. Cinco variantes fijas.
Altura ~22px. Texto 11px semibold.

### Tarjeta de expediente
`.card .card-expediente .estado-{estado}` — borde izquierdo 4px con accent.
Estructura: `card-accent` + `card-body` (num · title · motivo · footer).
`card-footer` = badge + meta. Chevron a la derecha.

### Botones
`.btn` base (44px h) + `.btn-primary / secondary / danger / ghost`.
Tamaños: `.btn-sm` (36px) · default · `.btn-lg` (52px).
`.btn-block` = ancho completo.

### Formularios
`.input` `.select` `.textarea` — borde 1.5px var(--border-strong).
Focus: borde brand + halo `rgba(37,99,235,0.12)`.
Error: `.error` → borde danger.
Labels: `.form-label` (11px uppercase semibold).

### Burbujas de comentario
`.bubble-wrap.own / .other` dentro de `.chat-thread`.
Propia: fondo brand, derecha. Ajena: fondo surface + borde, izquierda.
Imágenes: `.bubble-images` (grid 3 cols).

### Estado vacío
`.empty-state` — icono 52px redondeado + título + cuerpo.

### Esqueleto de carga
`.skeleton` con animación shimmer. Variantes: `.skeleton-card` `.skeleton-text` `.skeleton-badge`.

### Toast
`.toast .toast-success / error / info` — fondo oscuro, texto claro. Animación entrada/salida.
Posición: sobre el nav inferior.

### Cabecera
`#app-header` — 56px, sticky, borde inferior, título bold 17px.

### Menú inferior
`#app-nav` — 56px. Item activo: color brand + línea 2px superior.

---

## Reglas del sistema

1. Ninguna pantalla nueva inventa un color. Todo viene de las variables.
2. El borde izquierdo de la tarjeta identifica el estado — no depender solo del badge.
3. Nada por debajo de 44px de objetivo táctil.
4. Los grises tienen matiz azulado frío, no son neutros puros.
5. Los cinco colores de estado no se reutilizan para otros significados.
