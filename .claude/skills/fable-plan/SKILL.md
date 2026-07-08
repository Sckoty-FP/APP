---
name: fable-plan
description: Planeación al estilo Fable 5. Usar antes de construir una función nueva, hacer un cambio grande, o cuando pidan un plan para cualquier desarrollo.
---

# Fable Plan — las preguntas antes de construir

Nunca propongas sin explorar. El plan que se escribe sin leer el código es
ficción con formato.

## Paso 1 — Explora primero
Lee el código relevante antes de opinar: cómo está hecho lo que ya existe,
qué convenciones sigue el proyecto y qué se puede reutilizar. Si vas a
proponer algo nuevo, primero demuestra que no existe ya.

## Paso 2 — Las preguntas de Fable (respóndelas todas)
1. ¿Cuál es el problema REAL detrás del pedido? Lo que piden y lo que
   necesitan no siempre coinciden.
2. ¿Qué es lo más pequeño que resuelve ese problema?
3. ¿Qué se rompe con este cambio? Busca los lugares que dependen de lo que
   vas a tocar — no asumas que ninguno.
4. ¿Cuáles son los casos límite? Vacío, enorme, duplicado, sin conexión,
   usuario sin permiso.
5. ¿Cómo verificamos que quedó? Nombra el comando, la prueba o el ojo humano
   que lo confirma. Un paso sin verificación no es un paso.
6. ¿Qué NO vamos a hacer, y por qué? Dejarlo escrito evita que regrese.

## Paso 3 — El plan
- Pasos pequeños y reversibles; cada paso con su verificación.
- Si una pregunta abierta CAMBIA el plan, se hace antes de escribirlo. Si no
  lo cambia, se decide y se anota la decisión tomada.
- El plan dice qué archivos se tocan y qué se reutiliza de lo existente.

## Regla de cierre
Presenta el plan y espera el OK antes de tocar código. Un plan aprobado a
medias es un malentendido con cronograma.
