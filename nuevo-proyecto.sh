#!/bin/bash
# Crea un proyecto nuevo con Fable Kickstart (macOS / Linux / Git Bash)
# Uso: bash nuevo-proyecto.sh /ruta/del/proyecto-nuevo
set -e
DEST="$1"
if [ -z "$DEST" ]; then
  echo "Uso: bash nuevo-proyecto.sh <carpeta-del-proyecto-nuevo>"
  echo "Ejemplo: bash nuevo-proyecto.sh ~/proyectos/mi-idea"
  exit 1
fi
if [ -e "$DEST/CLAUDE.md" ]; then
  echo "Error: $DEST ya tiene un CLAUDE.md - no sobreescribo un proyecto existente."
  exit 1
fi
KIT_DIR="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$DEST"
# Copia todo el kit excepto la memoria de proyecto (proyecto/) y este script no hace falta duplicarlo, pero no estorba
(cd "$KIT_DIR" && tar --exclude='./proyecto' --exclude='./.git' -cf - .) | (cd "$DEST" && tar -xf -)
echo ""
echo "Kit instalado en: $DEST"
echo ""
echo "Siguientes pasos:"
echo "  cd \"$DEST\""
echo "  claude"
echo "  /iniciar"
