#!/bin/bash
# Preflight de Fable Kickstart — verifica lo básico para arrancar cualquier proyecto.
PASS=0; FAIL=0
ok()   { echo "  [OK]   $1"; PASS=$((PASS+1)); }
bad()  { echo "  [FAIL] $1"; FAIL=$((FAIL+1)); }
warn() { echo "  [WARN] $1"; }

echo "Fable Kickstart - Preflight"
echo "---------------------------"
command -v git >/dev/null 2>&1 && ok "git $(git --version | awk '{print $3}')" || bad "git no encontrado - instalar de https://git-scm.com"
if command -v node >/dev/null 2>&1; then ok "Node.js $(node --version) (por si el proyecto lo necesita)"; else warn "Node.js no instalado - solo necesario si el proyecto lo usa"; fi
if command -v python3 >/dev/null 2>&1; then ok "Python $(python3 --version 2>&1 | awk '{print $2}')"; else warn "Python no instalado - solo necesario si el proyecto lo usa"; fi
if curl -s --max-time 8 -o /dev/null https://github.com; then ok "Internet"; else warn "Sin internet - la investigacion de competencia no funcionara"; fi
if [ -f proyecto/estado.md ]; then warn "Hay un proyecto en curso (proyecto/estado.md existe) - usa /continuar"; else ok "Sin proyecto en curso - listo para /iniciar"; fi
echo "---------------------------"
[ $FAIL -eq 0 ] && { echo "Listo para arrancar ($PASS OK)."; exit 0; } || { echo "$FAIL fallo(s) criticos."; exit 1; }
