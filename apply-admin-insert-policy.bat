@echo off
echo ========================================
echo Aplicando politica RLS de INSERT para admins
echo ========================================

echo.
echo 1. Aplicando migracion...
npx supabase db push

echo.
echo 2. Verificando aplicacion...
if %ERRORLEVEL% EQU 0 (
    echo ✅ Migracion aplicada exitosamente
    echo.
    echo 3. Instrucciones para verificar:
    echo    - Ve a tu proyecto Supabase Dashboard
    echo    - Navega a Authentication ^> Policies
    echo    - Busca la tabla memorial_favorites
    echo    - Verifica que existe la politica "Admins can insert any favorites"
    echo.
    echo 4. Prueba el boton de favoritos en tu aplicacion
) else (
    echo ❌ Error al aplicar migracion
    echo.
    echo Solucion manual:
    echo 1. Ve a Supabase Dashboard
    echo 2. Authentication ^> Policies
    echo 3. memorial_favorites ^> New Policy
    echo 4. Nombre: "Admins can insert any favorites"
    echo 5. Target roles: "authenticated"
    echo 6. Using expression: EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
    echo 7. Policy definition: INSERT
)

echo.
pause 