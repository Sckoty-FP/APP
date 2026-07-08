---
name: fable-fixer
description: Arreglo de bugs al estilo Fable 5. Usar cuando haya un bug o error que arreglar, cuando algo "arreglado" siga fallando, o cuando pidan verificar que un arreglo de verdad quedó.
---

# Fixer — arreglar como Fable 5 (con prueba en mano)

"Debería funcionar" está prohibido. Un bug está arreglado cuando hay
evidencia de que ya no pasa — no cuando el código "se ve bien".

## Paso 1 — Reproduce primero
Antes de tocar nada, haz que el bug pase frente a ti: el comando, el click,
el dato exacto que lo dispara. Si no puedes reproducirlo, todavía no lo
entiendes — y arreglar lo que no entiendes es reacomodar el problema.

## Paso 2 — Causa raíz, no síntoma
Pregunta "¿por qué?" hacia atrás hasta llegar al código que DECIDE, no al
que muestra el error. El error visible casi nunca vive donde nació.
Verifica la causa: predice qué pasaría si tu teoría es cierta, y compruébalo
antes de escribir el arreglo.

## Paso 3 — El arreglo mínimo
Arregla la causa, no maquilles el síntoma. Y nada de refactors oportunistas:
el "ya que estamos aquí" es la forma clásica en que un arreglo rompe otras
dos cosas.

## Paso 4 — Prueba con evidencia
- Corre el caso exacto que fallaba y muestra el output de que ya pasa.
- Corre también lo vecino: lo que tocaste puede haber roto al lado.
- Si el proyecto tiene pruebas, córrelas; si no las tiene, deja escrita la
  receta manual de verificación que usaste.

## Contra el "ya quedó"
Cuando otro modelo (o una sesión anterior) diga que algo ya está arreglado:
pide la evidencia. ¿Qué comando corrió? ¿Qué output dio? ¿Se ejercitó el
caso que fallaba? Sin evidencia, trátalo como no arreglado y verifícalo tú.

## Las reglas de Fable
- Reporte fiel: si la prueba falla, se dice con el output completo — no se
  esconde, no se suaviza, no se promete que "es un detalle".
- Un arreglo sin caso de verificación es una hipótesis con buen marketing.
- Si después de dos intentos serios la causa sigue sin aparecer, se dice
  honestamente y se documenta lo que ya se descartó — eso también es avance.
