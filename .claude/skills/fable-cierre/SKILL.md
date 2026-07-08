---
name: fable-cierre
description: Cierre de proyectos al estilo Fable 5. Usar cuando la v1 este funcionando y haya que terminarla de verdad, cuando el proyecto este estancado en errores y testeo, o cuando pidan cerrar o lanzar un proyecto.
---

# El cierre — terminar de verdad (la fase que casi nadie hace)

Los proyectos no se abandonan al principio: se abandonan al 85%, en la
etapa de errores y testeo, cuando ya no es divertido. Este manual existe
para cruzar ese 15% final.

## La regla madre
"Terminado" solo existe si se definió antes. Los criterios de terminado se
escribieron en la Fase 4 (proyecto/plan.md). Si no existen, escríbelos AHORA
con el dueño — máximo 10, verificables, tipo "un usuario puede X y pasa Y" —
y luego cierra contra esa lista. Nunca contra la sensación de "ya casi".

## Paso 1 — La pasada de verificación
- Cada criterio de terminado se verifica uno por uno, CON EVIDENCIA
  (comando + output, o captura, o receta manual ejecutada).
- Lo que falla entra a una lista única de pendientes. Se priorizan: ¿cuáles
  bloquean el lanzamiento y cuáles son cosmética? Solo los bloqueantes
  detienen el cierre — la cosmética va a proyecto/ideas.md para la v2.

## Paso 2 — La ronda de fixes (con límite)
- Los bloqueantes se arreglan con el manual del fixer: reproducir, causa
  raíz, arreglo mínimo, prueba con evidencia.
- Regla anti-estancamiento: las rondas de fix se cuentan. Si después de 3
  rondas siguen apareciendo bloqueantes nuevos, PARA — el problema no son
  los bugs, es el alcance o la arquitectura. Se habla con el dueño antes de
  seguir tapando goteras: recortar alcance suele ser la salida.

## Paso 3 — El lanzamiento mínimo digno
- Deploy a producción y prueba del flujo completo EN producción.
- README honesto: qué hace, cómo se corre, qué NO hace todavía.
- Operación mínima: dónde se ven los errores, qué hacer si se cae, respaldo
  si hay datos de usuarios.

## Paso 4 — El acta de cierre
En proyecto/estado.md, la entrada final:
- Fecha, URL/entregable, criterios de terminado en verde (con su evidencia).
- Retro de 5 minutos: qué ayudó, qué dolió, qué haríamos distinto. Esto
  alimenta el próximo arranque — las cicatrices que no se anotan se repiten.
- proyecto/ideas.md queda como el menú priorizado de la v2.

## Las reglas de Fable
- Un proyecto al 85% no vale 85%: vale casi cero hasta que cruza la meta.
  Recortar alcance para cruzarla HOY vale más que la versión completa que
  nunca llega.
- Prohibido "después lo documento": el README se escribe en el cierre o no
  se escribe nunca.
- Celebrar es parte del cierre: cuando el acta está firmada, se le dice al
  dueño con todas sus letras que TERMINÓ un proyecto. La mayoría no llega.
