/**
 * Módulo de dominio — comentarios e imágenes.
 * Los comentarios son inmutables: nunca se borran ni editan.
 */

import { getSupabase } from './supabase.js';

// ── Comentarios ────────────────────────────────────────────────

export async function listarComentarios(expedienteId) {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('comentarios')
    .select(`
      id, comentario, fecha,
      usuario:usuario_id ( id, nombre ),
      imagenes ( id, url )
    `)
    .eq('expediente_id', expedienteId)
    .order('fecha', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function crearComentario(expedienteId, usuarioId, texto) {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('comentarios')
    .insert({
      expediente_id: expedienteId,
      usuario_id:    usuarioId,
      comentario:    texto || null,
    })
    .select('id')
    .single();
  if (error) throw error;
  return data;
}

// ── Imágenes ───────────────────────────────────────────────────

export async function subirFoto(comentarioId, expedienteId, file) {
  const sb   = getSupabase();
  const blob = await comprimirImagen(file);
  const path = `${expedienteId}/${comentarioId}/${crypto.randomUUID()}.jpg`;

  const { error: uploadErr } = await sb.storage
    .from('fotos-expedientes')
    .upload(path, blob, { contentType: 'image/jpeg' });
  if (uploadErr) throw uploadErr;

  const { error: dbErr } = await sb
    .from('imagenes')
    .insert({ comentario_id: comentarioId, url: path });
  if (dbErr) throw dbErr;

  return path;
}

export async function urlFirmada(path) {
  const sb = getSupabase();
  const { data, error } = await sb.storage
    .from('fotos-expedientes')
    .createSignedUrl(path, 3600);  // 1 hora de validez
  if (error) throw error;
  return data.signedUrl;
}

// ── Compresión en cliente ──────────────────────────────────────
// Máx 1600px en el lado más largo, calidad JPEG 0.8

export function comprimirImagen(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const src = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(src);
      const MAX = 1600;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        const r = Math.min(MAX / width, MAX / height);
        width  = Math.round(width  * r);
        height = Math.round(height * r);
      }
      const canvas = document.createElement('canvas');
      canvas.width  = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        b => b ? resolve(b) : reject(new Error('Error al comprimir la imagen')),
        'image/jpeg',
        0.8
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(src);
      reject(new Error('No se pudo leer la imagen'));
    };

    img.src = src;
  });
}
