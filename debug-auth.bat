@echo off
echo ========================================
echo    DEBUG DE AUTENTICACION - FUNERARIA
echo ========================================
echo.

echo 🔍 Debuggeando autenticación y carga de usuarios...
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

echo 🔍 Ejecutando debug...
echo.

REM Ejecutar el script de debug
node scripts/debug-auth.js

echo.
echo ✅ Debug completado
echo.
echo 💡 Revisa la consola del navegador (F12) para ver los logs
echo    cuando vayas a /auth como administrador
echo.
pause 