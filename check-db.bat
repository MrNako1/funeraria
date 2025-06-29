@echo off
echo ========================================
echo    VERIFICADOR DE BASE DE DATOS
echo ========================================
echo.

echo 🔍 Verificando estado de la base de datos...
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

echo 🔍 Ejecutando verificación...
echo.

REM Ejecutar el script de verificación
node scripts/check-db-status.js

echo.
echo ✅ Verificación completada
echo.
pause 