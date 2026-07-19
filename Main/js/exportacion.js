/**
 * Módulo de exportación PDF.
 * jsPDF se carga dinámicamente solo cuando el usuario pulsa el botón.
 */

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

  const ESTADO_LABEL = {
    pendiente: 'Pendiente', en_gestion: 'En gestión',
    pendiente_revision: 'P. revisión', rescatada: 'Rescatada', cerrada: 'Cerrada',
  };

  const rows = expedientes.map(e => [
    `#${e.mantenimiento}`,
    e.instalacion,
    e.jefe?.nombre ?? '—',
    ESTADO_LABEL[e.estado] ?? e.estado,
    new Date(e.fecha_creacion).toLocaleDateString('es-ES', {
      day: '2-digit', month: '2-digit', year: '2-digit',
    }),
  ]);

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

// ── Exportar resumen de KPIs ────────────────────────────────────

export async function exportarKPIs(kpis, tendencia, extras = {}) {
  const JsPDF = await cargarJsPDF();
  const doc   = new JsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  let y = cabecera(doc, 'Informe de estadísticas');

  // Calcular derivados
  const activos     = (kpis.pendiente || 0) + (kpis.en_gestion || 0) + (kpis.pend_revision || 0);
  const finalizados = (kpis.rescatada || 0) + (kpis.cerrada || 0);
  const tasa        = finalizados > 0
    ? Math.round(((kpis.rescatada || 0) / finalizados) * 100)
    : 0;

  // ── KPI cards (fila de 4 cajas) ──────────────────────────────
  const tarjetas = [
    { label: 'Total expedientes', valor: kpis.total     ?? 0 },
    { label: 'Activos',           valor: activos              },
    { label: 'Rescatadas',        valor: kpis.rescatada ?? 0 },
    { label: 'Tasa de rescate',   valor: `${tasa}%`           },
  ];

  const boxW = 42, boxH = 20, gap = 4;
  tarjetas.forEach((t, i) => {
    const x = 14 + i * (boxW + gap);
    doc.setFillColor(252, 245, 245);
    doc.roundedRect(x, y, boxW, boxH, 2, 2, 'F');
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(92, 10, 10);
    doc.text(String(t.valor), x + boxW / 2, y + 11, { align: 'center' });
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(t.label, x + boxW / 2, y + 17, { align: 'center' });
  });

  y += boxH + 8;

  // ── Gráfico de torta ─────────────────────────────────────────
  if (extras.chartImg) {
    const chartSize = 65;
    doc.addImage(extras.chartImg, 'PNG', 14, y, chartSize, chartSize);

    // Leyenda de estados al lado del gráfico
    const ESTADO_LABEL = {
      pendiente: 'Pendiente', en_gestion: 'En gestión',
      pend_revision: 'Pend. revisión', rescatada: 'Rescatada', cerrada: 'Cerrada',
    };
    const COLORES = ['#f59e0b', '#6366f1', '#8b5cf6', '#10b981', '#6b7280'];
    const keys    = Object.keys(ESTADO_LABEL);
    let ly = y + 8;
    keys.forEach((k, i) => {
      const val = kpis[k] || 0;
      doc.setFillColor(...hexToRgb(COLORES[i]));
      doc.rect(85, ly - 3, 4, 4, 'F');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(40, 40, 40);
      doc.text(`${ESTADO_LABEL[k]}: ${val}`, 92, ly);
      ly += 10;
    });

    y += chartSize + 6;
  }

  // ── Tendencia mensual ─────────────────────────────────────────
  if (tendencia?.length) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text('Tendencia mensual', 14, y);
    y += 3;

    doc.autoTable({
      startY: y,
      head: [['Mes', 'Nuevos', 'Rescatados', 'Cerrados']],
      body: tendencia.map(t => [t.mes, t.nuevos ?? 0, t.rescatadas ?? 0, t.cerradas ?? 0]),
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: [92, 10, 10], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [252, 245, 245] },
      margin: { left: 14, right: 14 },
    });

    y = doc.lastAutoTable.finalY + 8;
  }

  // ── Lista de expedientes ──────────────────────────────────────
  if (extras.expedientes?.length) {
    const ESTADO_LABEL = {
      pendiente: 'Pendiente', en_gestion: 'En gestión',
      pendiente_revision: 'P. revisión', rescatada: 'Rescatada', cerrada: 'Cerrada',
    };

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text('Lista de expedientes', 14, y);
    y += 3;

    doc.autoTable({
      startY: y,
      head: [['Nº Mant.', 'Instalación', 'Jefe de equipo', 'Motivo', 'Estado', 'Fecha']],
      body: extras.expedientes.map(e => [
        `#${e.mantenimiento}`,
        e.instalacion,
        e.jefe?.nombre ?? '—',
        e.motivo?.slice(0, 45) + (e.motivo?.length > 45 ? '…' : '') ?? '—',
        ESTADO_LABEL[e.estado] ?? e.estado,
        new Date(e.fecha_creacion).toLocaleDateString('es-ES', { day:'2-digit', month:'2-digit', year:'2-digit' }),
      ]),
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [92, 10, 10], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [252, 245, 245] },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 52 },
        2: { cellWidth: 35 },
        3: { cellWidth: 52 },
        4: { cellWidth: 22 },
        5: { cellWidth: 18 },
      },
      margin: { left: 14, right: 14 },
    });
  }

  // Pie de página
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(160, 160, 160);
    doc.text(`Página ${i} de ${pageCount}`, 196, 290, { align: 'right' });
  }

  doc.save(`informe_${_fechaArchivo()}.pdf`);
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function _fechaArchivo() {
  return new Date().toISOString().slice(0, 10);
}
