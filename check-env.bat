@echo off
echo ========================================
echo    VERIFICACION DE VARIABLES DE ENTORNO
echo ========================================
echo.

echo Verificando variables de entorno de Supabase...
echo.

if defined NEXT_PUBLIC_SUPABASE_URL (
    echo ✅ NEXT_PUBLIC_SUPABASE_URL: Configurada
    echo    Valor: %NEXT_PUBLIC_SUPABASE_URL%
) else (
    echo ❌ NEXT_PUBLIC_SUPABASE_URL: NO CONFIGURADA
)

echo.

if defined NEXT_PUBLIC_SUPABASE_ANON_KEY (
    echo ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: Configurada
    echo    Valor: %NEXT_PUBLIC_SUPABASE_ANON_KEY:~0,20%...
) else (
    echo ❌ NEXT_PUBLIC_SUPABASE_ANON_KEY: NO CONFIGURADA
)

echo.
echo ========================================
echo.

if not defined NEXT_PUBLIC_SUPABASE_URL (
    echo 🔧 SOLUCION:
    echo 1. Ve a tu proyecto en Supabase Dashboard
    echo 2. Ve a Settings > API
    echo 3. Copia la URL del proyecto
    echo 4. Copia la anon/public key
    echo 5. Crea un archivo .env.local en la raiz del proyecto
    echo 6. Agrega las variables con los valores copiados
    echo.
    echo Ejemplo del archivo .env.local:
    echo NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
    echo NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-aqui
    echo.
    pause
) else (
    echo ✅ Todas las variables estan configuradas correctamente
    echo.
    echo Ahora puedes ejecutar: npm run dev
    echo.
    pause
) 