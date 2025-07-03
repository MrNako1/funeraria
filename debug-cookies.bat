@echo off
echo ========================================
echo    DIAGNOSTICO DE COOKIES - FUNERARIA
echo ========================================
echo.

echo 🔍 Ejecutando diagnóstico de cookies...
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
    echo - NEXT_PUBLIC_SUPABASE_ANON_KEY
    echo.
)

echo 🔍 Verificando configuración...
echo.

REM Ejecutar el script de diagnóstico
node scripts/debug-cookies.js

echo.
echo ✅ Diagnóstico completado
echo.
echo 💡 Para verificar cookies en el navegador:
echo 1. Abre las herramientas de desarrollador (F12)
echo 2. Ve a la pestaña Application/Storage
echo 3. Revisa las cookies del dominio
echo 4. Verifica localStorage y sessionStorage
echo.
pause 