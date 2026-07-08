#!/bin/bash
# SckotyAI — interfaz de bienvenida de Fable Kickstart
# Uso: bash scripts/sckoty.sh

C1=$'\033[38;5;51m'   # cian brillante
C2=$'\033[38;5;45m'
C3=$'\033[38;5;39m'
C4=$'\033[38;5;33m'
MG=$'\033[38;5;213m'  # magenta
GD=$'\033[38;5;220m'  # dorado
GR=$'\033[38;5;245m'  # gris
WH=$'\033[1;97m'      # blanco bold
OK=$'\033[38;5;83m'   # verde
RS=$'\033[0m'

echo ""
echo "${C1}  ███████╗ ██████╗██╗  ██╗ ██████╗ ████████╗██╗   ██╗     █████╗ ██╗${RS}"
echo "${C2}  ██╔════╝██╔════╝██║ ██╔╝██╔═══██╗╚══██╔══╝╚██╗ ██╔╝    ██╔══██╗██║${RS}"
echo "${C2}  ███████╗██║     █████╔╝ ██║   ██║   ██║    ╚████╔╝     ███████║██║${RS}"
echo "${C3}  ╚════██║██║     ██╔═██╗ ██║   ██║   ██║     ╚██╔╝      ██╔══██║██║${RS}"
echo "${C4}  ███████║╚██████╗██║  ██╗╚██████╔╝   ██║      ██║       ██║  ██║██║${RS}"
echo "${C4}  ╚══════╝ ╚═════╝╚═╝  ╚═╝ ╚═════╝    ╚═╝      ╚═╝       ╚═╝  ╚═╝╚═╝${RS}"
echo ""
echo "${GR}  ─────────────  ${WH}El socio técnico que sí te dice la verdad${GR}  ─────────────${RS}"
echo ""

# Estado del proyecto
if [ -f proyecto/estado.md ]; then
    FASE=$(grep -m1 "Fase actual" proyecto/estado.md | sed 's/.*Fase actual:\**//;s/^ *//;s/ *$//')
    NOMBRE=$(grep -m1 "Nombre" proyecto/brief.md 2>/dev/null | sed 's/.*Nombre:\**//;s/^ *//')
    echo "${OK}  ● Proyecto en curso${RS}${WH}${NOMBRE:+ — $NOMBRE}${RS}"
    [ -n "$FASE" ] && echo "${GR}    Fase actual:${RS} $FASE"
    echo "${GR}    Retoma donde quedaste con ${GD}/continuar${RS}"
else
    echo "${GR}  ○ Sin proyecto en curso — arranca uno con ${GD}/iniciar${RS}"
fi

echo ""
echo "${MG}  ┌─ COMANDOS ─────────────────────────────────────────────────────┐${RS}"
echo "${MG}  │${RS}  ${GD}/iniciar${RS}     Proyecto nuevo: cuestionario, crítica y fases    ${MG}│${RS}"
echo "${MG}  │${RS}  ${GD}/continuar${RS}   Retomar donde quedaste (lee la memoria en disco) ${MG}│${RS}"
echo "${MG}  │${RS}  ${GD}/criticar${RS}    Abogado del diablo sobre cualquier idea          ${MG}│${RS}"
echo "${MG}  │${RS}  ${GD}/auditar${RS}     Chequeo de seguridad con evidencia               ${MG}│${RS}"
echo "${MG}  │${RS}  ${GD}/cerrar${RS}      Terminar de verdad: verificación, deploy y acta  ${MG}│${RS}"
echo "${MG}  │${RS}  ${GD}/renovar${RS}     Auditar y refactorizar un proyecto ya construido  ${MG}│${RS}"
echo "${MG}  └────────────────────────────────────────────────────────────────┘${RS}"
echo ""
echo "${GR}  Reglas de la casa: las ideas nuevas van a ${WH}ideas.md${GR}, no a la v1 ·${RS}"
echo "${GR}  cada sesión termina corriendo y committeada · sin evidencia no está arreglado${RS}"
echo ""
