@echo off
echo ========================================
echo    LIMPIADOR DE SESIONES - FUNERARIA
echo ========================================
echo.

echo 🧹 Limpiando sesiones de Supabase...
echo.

REM Verificar si Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Node.js no está instalado
    echo Por favor instala Node.js desde https://nodejs.org/
    pause
    exit /b 1
)

REM Verificar si el archivo .env existe
if not exist ".env.local" (
    echo ⚠️  Advertencia: No se encontró el archivo .env.local
    echo Asegúrate de tener configuradas las variables de entorno:
    echo - NEXT_PUBLIC_SUPABASE_URL
    echo - SUPABASE_SERVICE_ROLE_KEY
    echo.
)

echo 🔍 Verificando configuración...
echo.

REM Ejecutar el script de limpieza
node scripts/clear-all-sessions.js

echo.
echo ✅ Proceso completado
echo.
echo 💡 Para limpiar también el navegador:
echo 1. Abre las herramientas de desarrollador (F12)
echo 2. Ve a la pestaña Application/Storage
echo 3. Limpia Local Storage y Session Storage
echo 4. Limpia las cookies
echo.
pause 