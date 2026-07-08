# Rutina de mantenimiento (.claude/loop.md del proyecto construido)

> Esta plantilla se copia a `.claude/loop.md` DENTRO del proyecto construido
> (no del kit) durante la Fase 5-6, adaptando los comandos al stack real.
> Se dispara con `/loop` a secas. Solo revisiones con meta medible.

Ejecuta esta rutina de mantenimiento y avísame SOLO si algo necesita mi atención:

1. Corre los tests: `[comando real del proyecto]`. Meta: 0 fallos.
2. Corre el lint/typecheck: `[comando real]`. Meta: 0 errores.
3. Busca TODOs/FIXMEs nuevos desde la última corrida. Meta: lista con archivo y línea.
4. Verifica que el proyecto compila: `[comando real]`. Meta: build exitoso.

Si todo pasa, responde en una línea: "Mantenimiento OK — tests, lint, build en verde."
Si algo falla, repórtalo con el output y arréglalo siguiendo el manual del fixer
(reproducir, causa raíz, arreglo mínimo, prueba con evidencia).
