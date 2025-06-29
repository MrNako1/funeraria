@echo off
echo ========================================
echo    VERIFICANDO USUARIO ADMIN
echo ========================================
echo.

echo 🔍 Verificando si el usuario admin existe y tiene el rol correcto...
echo.

node scripts/check-admin-user.js

echo.
echo ========================================
echo.
pause 