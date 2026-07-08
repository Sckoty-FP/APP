# Guía: gentle-ai junto a Fable Kickstart

gentle-ai es un configurador de ecosistema (CLI en Go) que le da a Claude Code
memoria persistente (Engram), flujo Spec-Driven Development, registro de skills
y diagnóstico. Se instala GLOBAL — no vive dentro de este kit — y se
auto-actualiza con su propio updater. Por eso NO lo copiamos aquí adentro:
congelar una versión sería peor que no tenerlo.

## Instalación (una sola vez)

**Windows (PowerShell):**
```powershell
irm https://raw.githubusercontent.com/Gentleman-Programming/gentle-ai/main/scripts/install.ps1 | iex
```

**Mac / Linux:**
```bash
curl -fsSL https://raw.githubusercontent.com/Gentleman-Programming/gentle-ai/main/scripts/install.sh | bash
```

Después de instalar, el TUI te pregunta qué agentes configurar — selecciona
Claude Code. Actualizaciones futuras: `gentle-ai upgrade`.

## Los comandos que vas a usar

| Comando | Qué hace | Cuándo |
|---------|----------|--------|
| `gentle-ai doctor` | Chequeo de salud: binarios, estado, Engram, disco | Cuando algo se sienta raro |
| `gentle-ai skill-registry refresh` | Re-escanea los skills instalados | Después de agregar/quitar skills |
| `engram projects list` | Ve qué proyectos tienen memoria y cuánta | Para revisar la memoria |
| `engram projects consolidate` | Arregla nombres duplicados ("mi-app" vs "Mi-App") | Cuando Engram "no encuentra" memoria que sí existe |
| `/sdd-init` (dentro de Claude) | Detecta stack y capacidades de testing del proyecto | Primera vez en un proyecto, o si cambia el stack |

## Sobre Engram (la memoria) — y sus fallas

Engram guarda memoria entre sesiones por proyecto. Es útil, pero a veces
falla (no responde, o "pierde" un proyecto por deriva de nombres). Reglas:

1. **`proyecto/estado.md` es la fuente de verdad, siempre.** Engram es
   complemento, no reemplazo. Si Engram y estado.md se contradicen, gana el
   archivo.
2. Si Engram "no recuerda": corre `engram projects consolidate` (arregla el
   80% de los casos — casi siempre es deriva de nombres).
3. Si sigue mal: `gentle-ai doctor` te dice si el servicio está caído.

## Quién manda cuándo (la regla de convivencia)

- **Dentro de un proyecto con Fable Kickstart:** manda el CLAUDE.md del kit —
  las fases, el socio crítico, el estado en disco. gentle-ai aporta memoria y
  skills globales por debajo.
- **El flujo SDD de gentle-ai** (spec → design → tasks → implement) sirve para
  funciones GRANDES dentro de la Fase 6 o en la v2 — es un microscopio por
  función. Las fases del kit son el mapa del proyecto completo. No compiten:
  operan a escalas distintas.
- **En proyectos sin kickstart** (contribuir a un repo ajeno, experimentos):
  ahí gentle-ai brilla solo, con su persona y su SDD.

## Lo que ya tomamos prestado de gentle-ai

Este kit ya incluye (copiados, licencia Apache-2.0):
- `work-unit-commits` — commits como unidades de trabajo revisables
- `gentle-branch-pr` — PRs con verificación issue-first
- `gentle-issue-creation` — issues bien formados

Y las reglas de delegación de agentes en CLAUDE.md (hilo principal delgado,
exploración delegada) están adaptadas de su tabla de delegation triggers.
