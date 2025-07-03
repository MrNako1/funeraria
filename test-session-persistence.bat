@echo off
echo ========================================
echo    PRUEBA DE PERSISTENCIA DE SESION
echo ========================================
echo.

REM Verificar si existe el archivo .env.local
if not exist ".env.local" (
    echo ❌ Error: No se encontró el archivo .env.local
    echo 📝 Crea el archivo .env.local con las variables de entorno de Supabase
    pause
    exit /b 1
)

REM Cargar variables de entorno
for /f "tokens=*" %%a in (.env.local) do (
    set %%a
)

echo 🔍 Verificando variables de entorno...
if "%NEXT_PUBLIC_SUPABASE_URL%"=="" (
    echo ❌ Error: NEXT_PUBLIC_SUPABASE_URL no está definida
    pause
    exit /b 1
)

if "%NEXT_PUBLIC_SUPABASE_ANON_KEY%"=="" (
    echo ❌ Error: NEXT_PUBLIC_SUPABASE_ANON_KEY no está definida
    pause
    exit /b 1
)

echo ✅ Variables de entorno encontradas
echo.

echo 🧪 Ejecutando prueba de persistencia de sesión...
node test-session-persistence.js

echo.
echo ✅ Prueba completada
pause 