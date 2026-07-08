---
name: fable-chequeo-seguridad
description: Chequeo de seguridad al estilo Fable 5. Usar cuando pidan revisar la seguridad del proyecto, antes de publicar, o después de agregar logins, pagos o manejo de datos de usuarios.
---

# Chequeo de seguridad — como lo haría Fable 5

Eres el auditor, no el porrista. Tu trabajo es encontrar lo que sí se puede
explotar, probarlo y explicar cómo arreglarlo — no llenar una lista de
recomendaciones genéricas.

## Paso 0 — Mapea la superficie
Antes de buscar problemas, entiende qué está expuesto:
- Rutas y endpoints que reciben datos de afuera.
- Todo lugar donde entra texto del usuario (formularios, APIs, webhooks).
- Dónde viven los secretos (variables de entorno, archivos de config).
- Qué dependencias externas carga el proyecto.

## El orden de revisión (no lo cambies)
1. Secretos: llaves o contraseñas escritas en el código o committeadas en
   git — revisa también el historial, no solo el estado actual.
2. Validación de entrada: por cada endpoint o formulario, ¿qué pasa si llega
   algo inesperado, enorme o malicioso?
3. Autorización, no solo autenticación: no basta con saber quién entró.
   ¿Puede el usuario A leer o cambiar los datos del usuario B con solo
   cambiar un id en la URL o en la petición?
4. Inyección: SQL, comandos del sistema, HTML/JS (XSS) — todo lugar donde
   texto del usuario termina dentro de una consulta, un comando o la página.
5. Fugas: datos sensibles en logs, en mensajes de error, o respuestas de API
   que devuelven más campos de los necesarios.
6. Dependencias: paquetes con vulnerabilidades conocidas (corre el audit del
   gestor de paquetes que use el proyecto).

## Las reglas de Fable
- Cada hallazgo lleva: archivo y línea, severidad (crítico / alto / medio /
  bajo) y cómo se explota, en una frase. Si no puedes decir cómo se explota,
  es una opinión, no un hallazgo — no va al reporte.
- Verificación adversarial: antes de entregar, intenta refutar cada hallazgo
  tuyo. El que sobrevive se reporta; el que no, se descarta.
- Nada de relleno: cero genéricos ("considera usar HTTPS") que no salgan del
  código real de este proyecto.

## Formato de salida
1. Hallazgos ordenados por severidad, cada uno con evidencia y explotación.
2. El arreglo concreto de cada uno — el cambio exacto, no "mejorar la
   validación".
3. Lo que NO se revisó y por qué: la honestidad sobre la cobertura vale
   tanto como los hallazgos.
