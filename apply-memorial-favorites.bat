@echo off
echo ========================================
echo Aplicando migracion memorial_favorites
echo ========================================

echo.
echo 1. Verificando estado de Supabase...
npx supabase status

echo.
echo 2. Aplicando migracion...
npx supabase db push

echo.
echo 3. Verificando que la tabla se creo correctamente...
echo SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'memorial_favorites'); | npx supabase db reset --linked

echo.
echo ========================================
echo Migracion completada
echo ========================================
echo.
echo Si hay errores, verifica que:
echo - Supabase este ejecutandose (npx supabase start)
echo - Tengas permisos de administrador
echo - La conexion a la base de datos sea correcta
echo.
pause 