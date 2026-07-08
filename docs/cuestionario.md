# Cuestionario de arranque (Fase 1)

Hazlo conversacional, por rondas. No leas esto en voz alta — es tu guía.
Después de cada ronda, resume lo que escuchaste. Si detectas una
contradicción, señálala en el momento.

## Ronda 1 — La idea
1. ¿Qué quieres construir? (en sus palabras, sin corregirlo todavía)
2. ¿Qué problema resuelve y a quién le duele ese problema hoy?
   - Si la respuesta es "a todo el mundo", presiona: nombra a UNA persona
     concreta con ese problema.
3. ¿Cómo resuelve esa gente el problema HOY, sin tu proyecto?
   - La respuesta revela a la competencia real (aunque sea "con Excel").
4. ¿Por qué tú? ¿Qué sabes, tienes o puedes hacer que otro no?

## Ronda 2 — El propósito y el dinero
5. ¿Esto es para uso cotidiano/personal, para aprender, o para monetizar?
6. Si es para monetizar: ¿quién pagaría, cuánto, y con qué frecuencia?
   - "No sé" es respuesta válida — se anota como hipótesis a comprobar.
7. ¿Cuánto tiempo REAL le puedes dedicar por semana? (sé escéptico con la
   primera cifra: la gente se sobreestima el doble)
8. ¿Cuánto dinero puede costar al mes sin que duela? (hosting, APIs, etc.)

## Ronda 3 — El alcance
9. ¿Cuál es la PRIMERA cosa visible que demostraría que funciona?
   - Esta es la meta de la semana 1, no el producto completo.
10. De todo lo que imaginas, ¿qué es lo MÍNIMO que ya sería útil?
11. ¿Qué NO va a hacer la versión 1? (ayúdalo a decirlo — el alcance que no
    se escribe crece solo)
12. ¿Cómo sabremos que la v1 está TERMINADA? (esto se convierte en los
    criterios de terminado — insiste hasta tener 5-10 verificables)

## Ronda 4 — Lo técnico
13. ¿Qué tipo de proyecto es? (web, app móvil, herramienta CLI, skill/agente,
    automatización, otro)
14. ¿Qué experiencia técnica tiene el dueño? (define cuánto explicar y qué
    stack puede mantener él solo)
15. ¿Maneja datos sensibles? (usuarios, pagos, salud, menores → la seguridad
    sube de prioridad desde el diseño; si hay datos personales de usuarios en
    Europa, RGPD aplica: aviso de privacidad y borrado de datos desde la v1)
16. ¿Cuánta gente lo usaría al inicio, siendo realistas? (10 usuarios ≠
    arquitectura para millones)
17. ¿Dónde le gustaría desplegarlo, o eso lo decides tú? (el deploy se decide
    hoy, no al final)
18. ¿Hay requisitos no funcionales que importen? (tiempos de respuesta,
    funcionar sin conexión, normativa del sector, número de usuarios
    simultáneos — casi siempre la respuesta es "los normales", pero cuando
    hay uno especial, cambia el diseño y hay que saberlo HOY)
19. ¿Hay algo que valga la pena vigilar o repetir automáticamente? (deploy,
    tests, la página en producción, precios de la competencia)
    - Si lo hay, se anota en el brief como candidato a loop — pero el loop
      solo se crea cuando cumpla las 3 condiciones de la sección "Loops" de
      CLAUDE.md: meta medible, tiempo definido, y que valga su ruido.
    - Default: ninguno. La mayoría de los proyectos en fase de arranque no
      ameritan loops — no los propongas por proponer.

## Cuando dice "no sé" / "tú decide"
Propón el default más barato y reversible, dilo en una frase con su porqué,
y anótalo en el brief como decisión tomada (no como pregunta abierta).

## Al cerrar todas las rondas
1. Si es monetizable: investiga la competencia con WebSearch ANTES de
   resumir (qué existe, qué cobra, qué le falta).
2. Escribe proyecto/brief.md con la plantilla de plantillas/brief.md.
3. Resume y pregunta: "¿Esto captura todo? Con tu OK paso a la crítica."
4. Continúa a la Fase 2 (abogado del diablo) — SIEMPRE, sin excepción.
