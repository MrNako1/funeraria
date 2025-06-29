@echo off
echo ========================================
echo   Asignar Rol Cliente
echo ========================================
echo.

if "%1"=="" (
    echo Uso: assign-cliente-role.bat "email@ejemplo.com"
    echo.
    echo Ejemplo: assign-cliente-role.bat "usuario@email.com"
    echo.
    echo Si no proporcionas un email, se listarán todos los usuarios disponibles.
    echo.
    pause
    node scripts/assign-cliente-role.js
) else (
    echo Asignando rol cliente a: %1
    echo.
    node scripts/assign-cliente-role.js "%1"
)

echo.
pause 