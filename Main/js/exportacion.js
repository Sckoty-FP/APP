/**
 * Módulo de exportación PDF.
 * jsPDF se carga dinámicamente solo cuando el usuario pulsa el botón.
 */

import { LABELS_ESTADO, ORDEN_ESTADO_PDF } from './config.js';

const JSPDF_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
const AUTOTABLE_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js';

async function cargarJsPDF() {
  if (window.jspdf?.jsPDF) return window.jspdf.jsPDF;
  await loadScript(JSPDF_CDN);
  await loadScript(AUTOTABLE_CDN);
  return window.jspdf.jsPDF;
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload  = resolve;
    s.onerror = () => reject(new Error(`No se pudo cargar: ${src}`));
    document.head.appendChild(s);
  });
}

function cabecera(doc, titulo, subtitulo) {
  const now = new Date().toLocaleDateString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  // Banda roja
  doc.setFillColor(92, 10, 10);
  doc.rect(0, 0, 210, 18, 'F');

  // Logo / título
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('SGR-PPA', 14, 12);

  // Subtítulo
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(titulo, 14, 22);
  if (subtitulo) {
    doc.setTextColor(120, 120, 120);
    doc.text(subtitulo, 14, 28);
  }

  // Fecha
  doc.setTextColor(120, 120, 120);
  doc.setFontSize(7);
  doc.text(`Generado: ${now}`, 196, 12, { align: 'right' });

  return subtitulo ? 33 : 27;
}

// ── Exportar lista de expedientes ───────────────────────────────

export async function exportarExpedientes(expedientes, filtrosDesc) {
  const JsPDF = await cargarJsPDF();
  const doc   = new JsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const startY = cabecera(doc, 'Lista de expedientes', filtrosDesc || null);

  // Ordenar por estado (Módulo G), dentro de cada grupo por fecha desc
  const ordenados = [...expedientes].sort((a, b) => {
    const ia = ORDEN_ESTADO_PDF.indexOf(a.estado);
    const ib = ORDEN_ESTADO_PDF.indexOf(b.estado);
    if (ia !== ib) return ia - ib;
    return new Date(b.fecha_creacion) - new Date(a.fecha_creacion);
  });

  // Construir filas con cabecera de grupo al cambiar de estado
  let ultimoEstado = null;
  const rows = [];
  for (const e of ordenados) {
    if (e.estado !== ultimoEstado) {
      rows.push([{
        content: LABELS_ESTADO[e.estado] ?? e.estado,
        colSpan: 5,
        styles: { fillColor: [92, 10, 10], textColor: 255, fontStyle: 'bold', fontSize: 8 },
      }]);
      ultimoEstado = e.estado;
    }
    rows.push([
      `#${e.mantenimiento}`,
      e.instalacion,
      e.jefe?.nombre ?? '—',
      LABELS_ESTADO[e.estado] ?? e.estado,
      new Date(e.fecha_creacion).toLocaleDateString('es-ES', {
        day: '2-digit', month: '2-digit', year: '2-digit',
      }),
    ]);
  }

  doc.autoTable({
    startY,
    head: [['Nº Mant.', 'Instalación', 'Jefe de equipo', 'Estado', 'Fecha']],
    body: rows,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [92, 10, 10], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [252, 245, 245] },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 70 },
      2: { cellWidth: 45 },
      3: { cellWidth: 28 },
      4: { cellWidth: 22 },
    },
    margin: { left: 14, right: 14 },
  });

  // Pie de página
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(160, 160, 160);
    doc.text(`Página ${i} de ${pageCount}`, 196, 290, { align: 'right' });
  }

  doc.save(`expedientes_${_fechaArchivo()}.pdf`);
}

// ── Informe de estadísticas (respeta el filtro activo de la pantalla) ──
// datos = obtenerEstadisticas() → { resumen, porMes, porJefe, tecnicos, motivos }
// etiqueta = etiquetaFiltro()   → "Jefe: Ana · Octubre 2026"

export async function exportarInforme(datos, etiqueta, extras = {}) {
  const JsPDF = await cargarJsPDF();
  const doc   = new JsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const { resumen: kpi, porMes, porJefe, tecnicos, motivos } = datos;

  let y = cabecera(doc, `Informe de estadísticas — ${etiqueta}`, 'Análisis de PPA');

  // ── KPI boxes ────────────────────────────────────────────────
  const finalizados = Number(kpi.rescatada || 0) + Number(kpi.cerrada || 0);
  const tasa = finalizados > 0
    ? `${Math.round((Number(kpi.rescatada || 0) / finalizados) * 100)}%`
    : '—';
  const activos = Number(kpi.en_gestion || 0) + Number(kpi.pend_revision || 0);

  const boxes = [
    { label: 'Total expedientes', valor: kpi.total ?? 0 },
    { label: 'Activos',           valor: activos },
    { label: 'Rescatadas',        valor: kpi.rescatada ?? 0 },
    { label: 'Tasa de rescate',   valor: tasa },
  ];
  const boxW = 42, boxH = 20, gap = 4;
  boxes.forEach((b, i) => {
    const x = 14 + i * (boxW + gap);
    doc.setFillColor(252, 245, 245);
    doc.roundedRect(x, y, boxW, boxH, 2, 2, 'F');
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(92, 10, 10);
    doc.text(String(b.valor), x + boxW / 2, y + 11, { align: 'center' });
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(b.label, x + boxW / 2, y + 17, { align: 'center' });
  });
  y += boxH + 10;

  const tabla = (titulo, head, body, columnStyles, vacio) => {
    if (y > 250) { doc.addPage(); y = 20; }
    _seccionTitulo(doc, titulo, y);
    doc.autoTable({
      startY: y + 5,
      head: [head],
      body: body.length ? body : [[vacio, ...head.slice(1).map(() => '')]],
      styles:             { fontSize: 8, cellPadding: 2.5 },
      headStyles:         { fillColor: [92, 10, 10], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [252, 245, 245] },
      columnStyles,
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 10;
  };
  const c = { halign: 'center' };

  // ── Gráfico de barras capturado de la pantalla (opcional) ────
  if (extras.chartImg) {
    _seccionTitulo(doc, 'Expedientes por mes', y);
    doc.addImage(extras.chartImg, 'PNG', 14, y + 4, 182, 55);
    y += 65;
  }

  tabla('Por mes (con acumulado)',
    ['Mes', 'Total', 'Rescatadas', 'No recuperables', 'Acumulado'],
    porMes.map(m => [m.mes, m.total, m.rescatada, m.cerrada, m.acumulado]),
    { 1: c, 2: c, 3: c, 4: c }, 'Sin datos para este filtro');

  if (porJefe.length > 1) {
    tabla('Por jefe de equipo',
      ['Jefe de equipo', 'Total', 'Rescatadas', 'No recuperables', 'Activos'],
      porJefe.map(j => [j.jefe_nombre, j.total, j.rescatada, j.cerrada, j.activos]),
      { 0: { cellWidth: 70 }, 1: c, 2: c, 3: c, 4: c }, 'Sin datos');
  }

  tabla('Ranking de técnicos (más expedientes)',
    ['#', 'Técnico', 'Jefe', 'Total', 'Resc.', 'No rec.', 'Motivo más repetido'],
    tecnicos.map((t, i) => [i + 1, t.tecnico_nombre, t.jefe_nombre ?? '—', t.total, t.rescatada, t.cerrada,
      t.motivo_frecuente ? `${t.motivo_frecuente} (${t.motivo_veces})` : '—']),
    { 0: { cellWidth: 8, halign: 'center' }, 1: { cellWidth: 38 }, 2: { cellWidth: 32 },
      3: { cellWidth: 13, ...c }, 4: { cellWidth: 13, ...c }, 5: { cellWidth: 14, ...c } },
    'Sin técnicos asignados en este filtro');

  tabla('Errores más repetidos y quiénes los generan',
    ['#', 'Motivo de fallo', 'Total', 'Resc.', 'No rec.', 'Técnicos que más lo repiten'],
    motivos.map((m, i) => [i + 1, m.motivo_nombre, m.total, m.rescatada, m.cerrada, m.tecnicos_top ?? '—']),
    { 0: { cellWidth: 8, halign: 'center' }, 1: { cellWidth: 55 },
      2: { cellWidth: 13, ...c }, 3: { cellWidth: 13, ...c }, 4: { cellWidth: 14, ...c } },
    'Sin datos para este filtro');

  // ── Pie de página ─────────────────────────────────────────────
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(160, 160, 160);
    doc.text(`Página ${i} de ${pageCount}`, 196, 290, { align: 'right' });
  }

  const slug = etiqueta.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  doc.save(`informe_${slug}_${_fechaArchivo()}.pdf`);
}

function _seccionTitulo(doc, texto, y) {
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 40, 40);
  doc.text(texto, 14, y);
  doc.setDrawColor(220, 38, 38);
  doc.setLineWidth(0.4);
  doc.line(14, y + 1.5, 196, y + 1.5);
}

function _fechaArchivo() {
  return new Date().toISOString().slice(0, 10);
}
