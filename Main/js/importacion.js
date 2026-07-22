/**
 * Módulo de importación Excel — SGR-PPA v3
 *
 * Flujo:
 *   1. parsearExcel(file)    → filas raw del xlsx
 *   2. analizarFilas(filas)  → clasifica en válidas / duplicadas / errores (sin escritura en BD)
 *   3. ejecutarImport(...)   → crea técnicos faltantes e inserta expedientes
 */

import { getSupabase } from './supabase.js';
import { listarMotivos } from './motivos.js';

// ── SheetJS (CDN, mismo patrón que estadisticas.js) ────────────

async function loadSheetJS() {
  if (window.XLSX) return;
  await new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

// ── Normalización para fuzzy match de motivos ──────────────────

function normalizar(str) {
  return (str ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

// ── Cargar catálogos desde BD ──────────────────────────────────

async function cargarCatalogos() {
  const sb = getSupabase();
  const [motivos, jefesRes, tecnicosRes] = await Promise.all([
    listarMotivos(),
    sb.from('usuarios').select('id, nombre, matricula').not('matricula', 'is', null),
    sb.from('tecnicos').select('id, nombre, matricula').not('matricula', 'is', null),
  ]);
  if (jefesRes.error)    throw new Error('Error al cargar jefes: ' + jefesRes.error.message);
  if (tecnicosRes.error) throw new Error('Error al cargar técnicos: ' + tecnicosRes.error.message);

  return {
    mapaMotivos:  new Map(motivos.map(m => [normalizar(m.nombre), m.id])),
    mapaJefes:    new Map((jefesRes.data ?? []).map(j => [j.matricula.toUpperCase(), j])),
    mapaTecnicos: new Map((tecnicosRes.data ?? []).map(t => [t.matricula.toUpperCase(), t])),
  };
}

// ── Parsear Excel → filas raw ──────────────────────────────────

/**
 * Lee el archivo Excel y devuelve un array de filas normalizadas.
 * Las columnas se buscan por nombre — si no existe, el campo queda null.
 */
export async function parsearExcel(file) {
  await loadSheetJS();
  const buffer = await file.arrayBuffer();
  const wb     = window.XLSX.read(buffer, { type: 'array', cellDates: true });
  const ws     = wb.Sheets[wb.SheetNames[0]];
  const rows   = window.XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });

  if (!rows.length) throw new Error('El archivo está vacío.');

  const headers = rows[0].map(h => String(h ?? '').trim());
  const idx = name => headers.findIndex(h => h.toLowerCase() === name.toLowerCase());

  const colFecha  = idx('Fecha de Mantenimiento');
  const colNMant  = idx('Nº de Mantenimiento');
  const colIns    = idx('ins_no');
  const colMotivo = idx('¿Por qué?');
  const colTec    = idx('Tecnico');
  const colJde    = idx('JDE');
  // Observaciones: primero "Motivo no PPA Carlos", fallback a "Observaciones"
  const colObs    = idx('Motivo no PPA Carlos') !== -1
    ? idx('Motivo no PPA Carlos')
    : idx('Observaciones');

  const filas = rows.slice(1)
    .map((row, i) => {
      const mantenimiento = row[colNMant] != null ? String(row[colNMant]).trim() : null;
      if (!mantenimiento) return null; // fila vacía

      const tecRaw = row[colTec] != null ? String(row[colTec]).trim() : null;
      const obsRaw = colObs >= 0 && row[colObs] != null ? String(row[colObs]).trim() : null;

      return {
        filaNumero:       i + 2,
        fecha:            row[colFecha] ?? null,
        mantenimiento,
        instalacion:      row[colIns]    != null ? String(row[colIns]).trim()    : null,
        motivoTexto:      row[colMotivo] != null ? String(row[colMotivo]).trim() : null,
        matriculaTecnico: tecRaw ? tecRaw.toUpperCase() : null,
        matriculaJde:     row[colJde]    != null ? String(row[colJde]).trim().toUpperCase() : null,
        observaciones:    obsRaw || null,
      };
    })
    .filter(Boolean);

  if (!filas.length) throw new Error('No se encontraron filas con datos.');
  return filas;
}

// ── Analizar filas (sin escritura en BD) ───────────────────────

/**
 * Clasifica las filas en válidas, duplicadas y con errores.
 * No escribe nada en BD — es seguro para la vista previa.
 */
export async function analizarFilas(filas) {
  const sb = getSupabase();
  const { mapaMotivos, mapaJefes, mapaTecnicos } = await cargarCatalogos();

  // Anti-duplicado en batch
  const mantenimientos = filas.map(f => f.mantenimiento);
  const { data: existentes, error: errExist } = await sb
    .from('expedientes')
    .select('mantenimiento')
    .in('mantenimiento', mantenimientos);
  if (errExist) throw new Error('Error al verificar duplicados: ' + errExist.message);
  const setExistentes = new Set((existentes ?? []).map(e => e.mantenimiento));

  const validas    = [];
  const duplicadas = [];
  const errores    = [];

  for (const fila of filas) {
    // Duplicado
    if (setExistentes.has(fila.mantenimiento)) {
      duplicadas.push({ fila: fila.filaNumero, mantenimiento: fila.mantenimiento });
      continue;
    }

    const problemas = [];

    // Instalación obligatoria
    if (!fila.instalacion) problemas.push('sin número de instalación (ins_no vacío)');

    // JDE → jefe_id (obligatorio)
    let jefeId = null;
    if (!fila.matriculaJde) {
      problemas.push('JDE vacío');
    } else {
      const jefe = mapaJefes.get(fila.matriculaJde);
      if (!jefe) {
        problemas.push(`JDE no registrado: ${fila.matriculaJde}`);
      } else {
        jefeId = jefe.id;
      }
    }

    // Motivo → motivo_id (fuzzy, opcional)
    let motivoId = null;
    if (fila.motivoTexto) {
      motivoId = mapaMotivos.get(normalizar(fila.motivoTexto)) ?? null;
    }

    // Técnico → buscar por matrícula (se crea al importar si no existe)
    const tecnicoId  = fila.matriculaTecnico ? (mapaTecnicos.get(fila.matriculaTecnico)?.id ?? null) : null;
    const crearTec   = fila.matriculaTecnico && !tecnicoId && !!jefeId;

    if (problemas.length) {
      errores.push({ fila: fila.filaNumero, mantenimiento: fila.mantenimiento, razones: problemas });
      continue;
    }

    validas.push({ ...fila, jefeId, tecnicoId, motivoId, crearTec });
  }

  return { validas, duplicadas, errores, mapaTecnicos };
}

// ── Ejecutar importación ───────────────────────────────────────

/**
 * Crea técnicos faltantes e inserta los expedientes válidos.
 * mapaTecnicos se pasa por referencia para compartir técnicos creados entre filas.
 */
export async function ejecutarImport(validas, userId, mapaTecnicos) {
  const sb = getSupabase();

  // Verificar sesión activa antes de iniciar el loop
  const { data: { session } } = await sb.auth.getSession();
  if (!session) throw new Error('Sesión expirada. Recargá la página e iniciá sesión de nuevo.');

  const importados    = [];
  const erroresImport = [];

  for (const fila of validas) {
    let tecnicoId = fila.tecnicoId;

    // Crear técnico al vuelo si no existe en la BD
    if (fila.crearTec && fila.matriculaTecnico && fila.jefeId) {
      const yaCreado = mapaTecnicos.get(fila.matriculaTecnico);
      if (yaCreado) {
        tecnicoId = yaCreado.id;
      } else {
        const { data: nuevo, error: errTec } = await sb
          .from('tecnicos')
          .insert({
            nombre:     fila.matriculaTecnico,
            matricula:  fila.matriculaTecnico,
            jefe_id:    fila.jefeId,
            activo:     true,
          })
          .select('id')
          .single();
        if (!errTec && nuevo) {
          tecnicoId = nuevo.id;
          mapaTecnicos.set(fila.matriculaTecnico, { id: nuevo.id });
        }
      }
    }

    // Formatear fecha
    let fechaMant = null;
    if (fila.fecha instanceof Date) {
      fechaMant = fila.fecha.toISOString().slice(0, 10);
    } else if (typeof fila.fecha === 'string' && fila.fecha) {
      fechaMant = fila.fecha.slice(0, 10);
    }

    const { error } = await sb.from('expedientes').insert({
      instalacion:         fila.instalacion,
      mantenimiento:       fila.mantenimiento,
      jefe_id:             fila.jefeId,
      tecnico_id:          tecnicoId,
      motivo_id:           fila.motivoId,
      observaciones:       fila.observaciones,
      fecha_mantenimiento: fechaMant,
      creado_por:          userId,
    });

    if (error) {
      erroresImport.push({
        fila: fila.filaNumero,
        mantenimiento: fila.mantenimiento,
        razones: [error.message],
      });
    } else {
      importados.push(fila.mantenimiento);
    }
  }

  return { importados, errores: erroresImport };
}
