@echo off
echo ========================================
echo Diagnostico Rapido de Favoritos
echo ========================================

echo.
echo 🔍 Verificando problemas comunes...

echo.
echo 1. Verificando archivo .env.local...
if exist .env.local (
    echo ✅ Archivo .env.local existe
) else (
    echo ❌ Archivo .env.local NO existe
    echo.
    echo 🔧 Solución: Crea el archivo .env.local con:
    echo NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
    echo NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
    echo.
    echo O ejecuta: check-env-favorites.bat
    goto :end
)

echo.
echo 2. Verificando migración de tabla...
if exist "supabase\migrations\20240320000014_create_memorial_favorites_table.sql" (
    echo ✅ Migración de favoritos existe
) else (
    echo ❌ Migración de favoritos NO existe
    echo.
    echo 🔧 Solución: La migración se creó pero no se aplicó
    echo Ejecuta: npx supabase db push
)

echo.
echo 3. Verificando componente...
if exist "src\components\memorial\MemorialFavoriteButton.tsx" (
    echo ✅ Componente MemorialFavoriteButton existe
) else (
    echo ❌ Componente MemorialFavoriteButton NO existe
)

echo.
echo 4. Verificando tipos de Supabase...
if exist "src\types\supabase.ts" (
    echo ✅ Tipos de Supabase existen
) else (
    echo ❌ Tipos de Supabase NO existen
    echo.
    echo 🔧 Solución: Ejecuta: npx supabase gen types typescript --local > src/types/supabase.ts
)

echo.
echo 5. Verificando dependencias...
if exist "node_modules\@supabase\supabase-js" (
    echo ✅ Supabase JS instalado
) else (
    echo ❌ Supabase JS NO instalado
    echo.
    echo 🔧 Solución: Ejecuta: npm install
)

echo.
echo ========================================
echo Resumen de Diagnostico
echo ========================================

echo.
echo 📋 Pasos para arreglar favoritos:
echo.
echo 1. Configura las variables de entorno:
echo    - Crea archivo .env.local con tus credenciales de Supabase
echo.
echo 2. Aplica la migración de la tabla:
echo    - Ejecuta: npx supabase db push
echo.
echo 3. Verifica la conexión:
echo    - Ejecuta: node debug-favorites.js
echo.
echo 4. Prueba el botón:
echo    - Inicia sesión en la aplicación
echo    - Ve a un memorial
echo    - Abre la consola del navegador (F12)
echo    - Haz clic en el botón de favoritos
echo    - Verifica los logs en la consola
echo.
echo 5. Si hay errores específicos:
echo    - Comparte los mensajes de error de la consola
echo    - Verifica que el usuario esté autenticado
echo    - Verifica que existan memoriales en la base de datos
echo.

:end
echo.
echo Presiona cualquier tecla para continuar...
pause > nul 