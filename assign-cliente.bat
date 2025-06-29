@echo off
echo ========================================
echo    ASIGNAR ROL CLIENTE - FUNERARIA
echo ========================================
echo.

if "%1"=="" (
    echo 📋 Uso: assign-cliente.bat "usuario@email.com"
    echo.
    echo Ejemplo: assign-cliente.bat "cliente@ejemplo.com"
    echo.
    echo 🔍 Listando usuarios disponibles...
    echo.
    node scripts/assign-cliente-role.js
) else (
    echo 🛒 Asignando rol cliente a: %1
    echo.
    node scripts/assign-cliente-role.js "%1"
)

echo.
echo ✅ Proceso completado
echo.
pause 