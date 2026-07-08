---
name: fable-refactor
description: Auditoria y renovacion de proyectos ya construidos. Usar cuando haya que revisar un proyecto existente, integrar cambios acumulados o pendientes, planear una refactorizacion, o cuando un proyecto se volvio dificil de modificar.
---

# Refactor — renovar un proyecto sin romperlo

Un proyecto ya construido no se "arregla de golpe": se audita, se estabiliza
y se renueva por pasos que nunca lo dejan roto. La regla madre: **el proyecto
tiene que seguir funcionando después de CADA paso** — un refactor que deja el
proyecto roto tres días es una demolición, no un refactor.

## Paso 1 — Auditoría (mirar antes de tocar)
Delega la exploración al agente `fable-auditor` (contexto limpio, solo
lectura). El resultado es el mapa del estado real:
- Qué hace el proyecto HOY y qué dice que hace (README vs realidad).
- Cambios a medio integrar: ramas sin mergear, código comentado, TODOs,
  features a medias, dependencias instaladas que nadie usa.
- Deuda rankeada: qué duele al modificar, qué está duplicado, qué no tiene
  pruebas, qué es frágil.
- Seguridad exprés (secretos, validación, dependencias con hoyos) — si hay
  algo crítico, se arregla ANTES de refactorizar nada.

## Paso 2 — Estabilizar la base
Antes de mover un solo archivo:
- El proyecto compila/corre: comando verificado con output.
- Red de seguridad mínima: si no hay tests, escribe smoke tests del flujo
  principal (3-5, no cobertura total) — son el detector de "rompí algo".
- Commit limpio de punto de partida. Todo lo que siga se compara contra aquí.

## Paso 3 — Integrar los cambios surgidos
Los cambios acumulados (ideas, ramas, parches a medias) se triage-an UNO por
uno con tres preguntas: ¿sigue haciendo falta? ¿está completo o a medias?
¿pelea con algo más? Resultado por cambio: INTEGRAR (con su verificación),
TERMINAR (qué falta exactamente), o DESCARTAR (se borra con commit propio —
el código muerto comentado "por si acaso" es deuda, no respaldo).

## Paso 4 — La estrategia de refactor
Con la base estable y los cambios resueltos, el plan:
- Prioriza por dolor/esfuerzo: primero lo que más estorba para trabajar y
  menos cuesta arreglar. La elegancia va al final de la fila.
- Pasos pequeños y reversibles, cada uno con verificación (los smoke tests +
  el caso específico de lo tocado). Un paso = un commit.
- Regla de dirección: refactoriza HACIA un destino escrito ("todas las rutas
  usan el mismo manejo de errores"), no "limpiar en general".
- Prohibido mezclar: un commit refactoriza O agrega funcionalidad, nunca
  ambas. Mezclado no se puede revertir ni revisar.

## Paso 5 — Ejecución con freno de mano
- Después de cada paso: correr verificación, commit, actualizar el plan.
- Si un paso rompe algo que no esperabas: revertir, entender por qué (manual
  del fixer), replanear ese paso. No "arreglar hacia adelante" a ciegas.
- Regla anti-hoyo-sin-fondo: si un paso lleva 3 intentos fallidos, se marca,
  se aparta y se sigue con el resto. Se reporta al dueño con lo aprendido.

## Las reglas de Fable
- Nada de "gran reescritura": la v2 desde cero es la forma más cara de
  perder lo aprendido en la v1. Se renueva por partes, funcionando siempre.
- Cada descarte se anota (qué se quitó y por qué) — lo que no se escribe se
  vuelve a intentar en tres meses.
- El refactor termina cuando el destino escrito se cumple, no cuando "se ve
  mejor". Criterios verificables, como todo en este kit.
