# El kit y el ciclo de vida del software (lo que estudias en DAM)

Las fases de Fable Kickstart no son un invento aparte: son el ciclo de vida
clásico del software, reordenado para proyectos de una persona con IA, y con
dos fases extra (crítica y negocio) que la academia asume pero no formaliza.
Esta tabla conecta lo que estudias con lo que el kit hace:

| Fase académica (SDLC) | Fase(s) del kit | Diferencia clave |
|----------------------|-----------------|------------------|
| Análisis (requisitos funcionales y no funcionales, documento ERS) | Fase 1 (cuestionario) + Fase 4.1 (alcance) | El brief.md es tu ERS en miniatura: funcionales = "qué hace la v1", no funcionales = pregunta 18, prioridades = criterios de terminado |
| — (no existe formal) | Fase 2 (abogado del diablo) + Fase 3 (negocio) | La academia asume que el proyecto vale la pena; aquí se comprueba antes de invertir |
| Diseño (dividir el sistema, elegir lenguaje, SGBD, entidades) | Fase 4.2 (stack) | Igual, pero con la regla de lo mínimo y aburrido, y cada decisión con su porqué en decisiones.md |
| Codificación | Fases 5-6 (día 1 + construcción) | Vertical (un flujo completo primero), con commits por unidad de trabajo y deploy desde el día 1 — no al final |
| Pruebas (unitarias → integración → beta test) | Fase 7 (endurecimiento) + Fase 8 (beta en producción) | Igual estructura; se añade el chequeo de seguridad con evidencia |
| Documentación (guía técnica, de uso, de instalación) | Fase 9 (cierre) | Las tres guías caben en un README de tres secciones en proyectos pequeños |
| Explotación (instalación, configuración, producción) | Fase 8 (lanzamiento) | El deploy temprano de la Fase 5 hace que esta etapa sea un no-evento |
| Mantenimiento (correctivo, perfectivo, evolutivo, adaptativo) | Fase 10 (siguiente iteración) | ideas.md clasificado por tipo de cambio; primero lo correctivo |

Dos ideas del ciclo de vida que el kit aplica en serio:

1. **"Puerta abierta para volver atrás":** las fases no se cierran con llave.
   Si en la Fase 6 se descubre que un requisito estaba mal planteado, se
   vuelve al brief y se corrige — pero por la puerta (actualizando el
   documento), no por la ventana (parcheando sin anotar).
2. **El mantenimiento es la etapa más larga.** Por eso el kit obliga a
   decisiones aburridas y documentadas: el código se escribe una vez y se
   mantiene años.

Modelos de ciclo de vida: el kit es en la práctica un modelo **iterativo
incremental** (v1 pequeña → cerrar → v2) con un arranque en cascada corta
(análisis y diseño antes de codificar). La cascada pura exige todos los
requisitos por adelantado y congela el diseño — funciona en proyectos súper
estables, no en los tuyos. La espiral (prototipos + análisis de riesgo por
vuelta) es para proyectos grandes con presupuesto; nuestra Fase 2 es su
análisis de riesgo, en una sola vuelta barata.
