@echo off
REM Crea un proyecto nuevo con Fable Kickstart (Windows)
REM Uso: nuevo-proyecto.bat "C:\proyectos\mi-idea"
setlocal

if "%~1"=="" (
    echo Uso: nuevo-proyecto.bat "C:\ruta\del\proyecto-nuevo"
    echo Ejemplo: nuevo-proyecto.bat "C:\proyectos\mi-idea"
    pause
    exit /b 1
)

set DEST=%~1

if exist "%DEST%\CLAUDE.md" (
    echo Error: %DEST% ya tiene un CLAUDE.md - no sobreescribo un proyecto existente.
    pause
    exit /b 1
)

echo Instalando Fable Kickstart en %DEST% ...
robocopy "%~dp0." "%DEST%" /E /XD proyecto .git /XF nul >nul
if errorlevel 8 (
    echo Error copiando archivos.
    pause
    exit /b 1
)

echo.
echo Kit instalado en: %DEST%
echo.
echo Siguientes pasos:
echo   1. Abre una terminal en esa carpeta
echo   2. Corre: claude
echo   3. Escribe: /iniciar
echo.
pause
