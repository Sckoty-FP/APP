# LEER PRIMERO — Fable Kickstart

Este kit convierte a Claude en tu socio técnico para **iniciar cualquier proyecto** — web, app, herramienta, skill, automatización, lo que sea — y llevarlo hasta el final. No es una plantilla de código: es el método de trabajo completo, con las preguntas, la crítica, las fases y la disciplina de cierre.

Está diseñado contra los tres males clásicos: proyectos que arrancan sin rumbo, ideas a mitad de camino que lo enredan todo, y proyectos que se abandonan al 85% en la etapa de errores y testeo.

---

## Qué necesitas

Solo **Claude Code** (`npm install -g @anthropic-ai/claude-code` → `claude login`) y **git**. El resto depende del proyecto que arranques — Claude lo verificará según lo que construyan juntos.

---

## Instalación: un comando por proyecto nuevo

Cada proyecto usa su propia copia del kit (así la memoria de un proyecto no se mezcla con otro). Para crear un proyecto nuevo:

**Windows:** abre una terminal en esta carpeta y corre
```
nuevo-proyecto.bat "C:\proyectos\mi-idea"
```

**Mac / Linux:**
```bash
bash nuevo-proyecto.sh ~/proyectos/mi-idea
```

El script copia todo lo necesario a la carpeta destino (sin la memoria `proyecto/` de otros usos) y se niega a sobreescribir un proyecto existente. No hay nada más que instalar: el kit es puro método — archivos que Claude lee.

## Cómo usarlo

### 1. Crea tu proyecto con el script de arriba

### 2. Abre una terminal en la carpeta y ejecuta
```bash
claude
```

### 3. Escribe
```
/iniciar
```
Te recibe **SckotyAI** — el banner de la terminal con el estado de tu proyecto y la leyenda de comandos. Si quieres verlo en cualquier momento: `bash scripts/sckoty.sh`

### 4. Responde con honestidad
Claude te hará 4 rondas de preguntas: la idea, el propósito y el dinero, el alcance, y lo técnico. Prepárate para que te presione — si dices "es para todo el mundo" te va a pedir UNA persona concreta; si dices que le dedicarás 20 horas semanales, va a dudar.

**Importante: después del cuestionario viene la crítica.** Claude jugará al abogado del diablo con tu idea — buscará qué la mata en un mes, quién no la usaría, si existe una alternativa más barata, y terminará con un veredicto: seguir, cambiar o matar. No es pesimismo: es matar proyectos malos en el día 1 en vez de en el mes 3. Si tu idea sobrevive la crítica, vale la pena construirla.

### 5. Deja que construya por fases
Si el veredicto es seguir: análisis de negocio (si quieres monetizar), alcance y stack con decisiones anotadas, plan verificable, y construcción — con deploy desde el día 1 y cada sesión terminando con el proyecto corriendo y guardado.

---

## Comandos

| Comando | Cuándo usarlo |
|---------|---------------|
| `/iniciar` | Empezar un proyecto nuevo desde cero |
| `/continuar` | Retomar donde quedaste (aunque hayan pasado semanas) |
| `/criticar` | Pedir el abogado del diablo sobre cualquier idea, en cualquier momento |
| `/auditar` | Chequeo de seguridad antes de publicar |
| `/cerrar` | Terminar el proyecto de verdad: verificación final, deploy y acta de cierre |
| `/renovar` | Auditar y renovar un proyecto YA construido (aunque no venga del kit): integra cambios pendientes y refactoriza sin romper |

---

## Las reglas que este kit te impone (y por qué te convienen)

**Se te van a ocurrir ideas a mitad del camino.** Claude las anotará en `proyecto/ideas.md` y seguirá con el plan. No entran a la v1. Esta regla existe porque las ideas de medio camino son la causa #1 de proyectos enredados que nunca terminan. Tus ideas no se pierden: son el menú de la v2.

**"Terminado" se define antes de empezar.** En el arranque escribirán juntos los criterios de terminado (5-10 cosas verificables). El proyecto se cierra contra esa lista, no contra la sensación de "ya casi". Así el testeo tiene final.

**Cada sesión termina con el proyecto corriendo y guardado.** Y con `proyecto/estado.md` actualizado. Por eso `/continuar` funciona aunque vuelvas un mes después.

**Claude no es tu porrista.** Si tu plan tiene un hoyo, te lo va a decir con el hoyo señalado y una alternativa. La aprobación que sobrevive a la crítica sí vale.

**Los loops se ganan su lugar.** Claude puede dejar tareas repitiéndose solas (`/loop`), pero solo cuando el proyecto lo amerita y la tarea tiene meta medible y tiempo definido. Un loop mal hecho da vueltas infinitas o interrumpe por nada — por eso el kit lo valida antes de crearlo.

**Rentabilidad máxima, costo mínimo.** Antes de aprobar cualquier cosa cara, Claude evalúa la alternativa barata que logra el 80%. Infra gratuita o de centavos hasta que haya usuarios que justifiquen más.

---

## Qué hay adentro

```
fable-kickstart/
├── CLAUDE.md              ← El orquestador: rol, reglas y las 10 fases
├── docs/cuestionario.md   ← Las preguntas del arranque (4 rondas)
├── .claude/
│   ├── agents/            ← fable-auditor: el auditor de solo lectura para /renovar
│   ├── commands/          ← /iniciar /continuar /criticar /auditar /cerrar /renovar
│   └── skills/            ← Los 7 manuales de método:
│       ├── fable-abogado-del-diablo   (crítica con veredicto)
│       ├── fable-negocio              (rentabilidad, competencia, costos)
│       ├── fable-arranque             (día 1 no negociable)
│       ├── fable-plan                 (las preguntas antes de construir)
│       ├── fable-fixer                (arreglar con prueba en mano)
│       ├── fable-chequeo-seguridad    (auditoría con evidencia)
│       ├── fable-cierre               (terminar de verdad)
│       ├── fable-refactor             (renovar proyectos existentes)
│       ├── frontend-design, ui-ux-pro-max, humanizer,
│       │   seo-audit, vercel-deploy, playwright-cli   (construcción web/SaaS)
│       └── work-unit-commits, gentle-branch-pr,
│           gentle-issue-creation                       (disciplina git, de gentle-ai)
├── docs/fases-vs-sdlc.md  ← Cómo se conecta el kit con el ciclo de vida que estudias en DAM
├── docs/gentle-ai.md      ← Guía del potenciador opcional
├── nuevo-proyecto.bat/.sh ← Instalador: copia el kit a un proyecto nuevo
├── plantillas/            ← brief, estado, decisiones, ideas, loop
├── scripts/sckoty.sh      ← SckotyAI: el banner de bienvenida con la leyenda de comandos
├── scripts/preflight.sh   ← Verificación de requisitos
└── proyecto/              ← (se crea al usar /iniciar) la memoria de TU proyecto
```

Los 5 manuales de método vienen de la guía "Fragmento de Fable" de tododeia.com; negocio y cierre se crearon para este kit. Los skills de construcción vienen de claude-webkit; los de git, de gentle-ai (Apache-2.0).

---

## Potenciador opcional: gentle-ai

gentle-ai NO viene incluido en este kit (es un programa aparte que se instala global y se auto-actualiza — copiarlo aquí congelaría sus versiones). Lo que sí incluimos son sus 3 skills de disciplina git y sus reglas de delegación de agentes, ya integradas.

Si además quieres su memoria persistente (Engram) y el flujo Spec-Driven Development, instálalo global con un comando — la guía completa de instalación, uso, y qué manda cuándo está en `docs/gentle-ai.md`.

## Una nota honesta

Estos manuales capturan un método de trabajo, no un modelo. Cuando Fable 5 ya no esté disponible, Opus y Sonnet seguirán estos mismos pasos — el resultado cambia menos de lo que crees, porque la mayor parte del valor está en el orden de las preguntas, la crítica obligatoria y la disciplina de verificación, y eso queda escrito aquí. Si tu forma de trabajar cambia, edita los skills: un manual rancio que se ve autoritativo es peor que ninguno.
