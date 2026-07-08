Renueva un proyecto ya construido: auditoría, integración de cambios pendientes y estrategia de refactor. Funciona sobre cualquier proyecto — venga del kit o no.

0. Muestra el banner: corre `bash scripts/sckoty.sh` y muestra su salida tal cual al usuario.
1. Pregunta (en un solo mensaje): ¿dónde está el proyecto? ¿qué te duele de él hoy? ¿hay cambios o ideas pendientes de integrar?
2. Carga el skill `fable-refactor` y sigue sus 5 pasos:
   - Delega la auditoría al agente `fable-auditor` (subagente, solo lectura, contexto limpio).
   - Presenta el reporte al dueño y acuerden el destino del refactor (escrito y verificable).
   - Estabiliza (smoke tests + commit base), triage de cambios surgidos, estrategia priorizada por dolor/esfuerzo.
3. Ejecuta por pasos: un paso = un commit = una verificación. Lo BLOQUEANTE de seguridad se arregla antes que todo.
4. Al terminar, escribe el resumen en `proyecto/estado.md` (o créalo si el proyecto no venía del kit — así queda adoptado por el método).
