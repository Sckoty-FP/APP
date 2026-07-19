-- =============================================================
-- SGR-PPA · Políticas de Storage — bucket fotos-expedientes
-- Ejecutar en Supabase SQL Editor después de crear el bucket.
-- =============================================================

-- Leer fotos:
--   supervisor y jefe_zona ven todo
--   jefe_equipo solo las fotos de sus propios expedientes
create policy "fotos: lectura"
  on storage.objects for select
  using (
    bucket_id = 'fotos-expedientes'
    and (
      rol_actual() in ('supervisor', 'jefe_zona')
      or (
        rol_actual() = 'jefe_equipo'
        and (storage.foldername(name))[1] in (
          select id::text from expedientes where jefe_id = auth.uid()
        )
      )
    )
  );

-- Subir fotos:
--   supervisor puede subir en cualquier expediente
--   jefe_equipo solo en los suyos
create policy "fotos: subir"
  on storage.objects for insert
  with check (
    bucket_id = 'fotos-expedientes'
    and (
      rol_actual() = 'supervisor'
      or (
        rol_actual() = 'jefe_equipo'
        and (storage.foldername(name))[1] in (
          select id::text from expedientes where jefe_id = auth.uid()
        )
      )
    )
  );
