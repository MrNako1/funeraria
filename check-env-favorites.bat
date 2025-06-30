@echo off
echo ========================================
echo Verificando configuracion de favoritos
echo ========================================

echo.
echo 1. Verificando archivo .env.local...

if exist .env.local (
    echo ✅ Archivo .env.local encontrado
    echo.
    echo Contenido del archivo:
    type .env.local
) else (
    echo ❌ Archivo .env.local NO encontrado
    echo.
    echo 🔧 Creando archivo .env.local...
    echo.
    echo Por favor, proporciona las siguientes variables:
    echo.
    set /p SUPABASE_URL="NEXT_PUBLIC_SUPABASE_URL: "
    set /p SUPABASE_KEY="NEXT_PUBLIC_SUPABASE_ANON_KEY: "
    echo.
    echo Creando archivo .env.local...
    echo NEXT_PUBLIC_SUPABASE_URL=%SUPABASE_URL% > .env.local
    echo NEXT_PUBLIC_SUPABASE_ANON_KEY=%SUPABASE_KEY% >> .env.local
    echo.
    echo ✅ Archivo .env.local creado
)

echo.
echo 2. Verificando variables de entorno...
node -e "
const fs = require('fs');
const path = require('path');

try {
    require('dotenv').config({ path: '.env.local' });
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    console.log('Variables encontradas:');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Configurada' : '❌ Faltante');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '✅ Configurada' : '❌ Faltante');
    
    if (!supabaseUrl || !supabaseKey) {
        console.log('\\n❌ Problema: Variables de entorno faltantes');
        console.log('Edita el archivo .env.local con tus credenciales de Supabase');
        process.exit(1);
    }
    
    console.log('\\n✅ Variables de entorno configuradas correctamente');
} catch (error) {
    console.log('❌ Error al verificar variables:', error.message);
    process.exit(1);
}
"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Error en la configuración
    echo.
    echo Para obtener tus credenciales de Supabase:
    echo 1. Ve a https://supabase.com
    echo 2. Inicia sesión en tu proyecto
    echo 3. Ve a Settings > API
    echo 4. Copia la URL y la anon key
    echo 5. Edita el archivo .env.local
    echo.
    pause
    exit /b 1
)

echo.
echo 3. Probando conexión a Supabase...
node debug-favorites.js

echo.
echo ========================================
echo Verificación completada
echo ========================================
echo.
pause 