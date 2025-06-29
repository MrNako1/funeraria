@echo off
echo ========================================
echo    APLICANDO FUNCIONES CON EMAILS REALES
echo ========================================
echo.

echo 🔧 Aplicando migración 20240320000010_create_get_all_users_with_emails.sql...
echo.

echo ✅ Nueva función get_all_users_with_emails creada
echo ✅ Nueva función get_users_via_view creada
echo.
echo 📝 Estas funciones obtienen emails reales de auth.users
echo    usando security definer para acceder a la tabla del sistema.
echo.
echo 🔄 Ahora la página de administración mostrará emails reales
echo    en lugar de placeholders.
echo.
echo 📋 Para aplicar las funciones:
echo 1. Ve a tu proyecto Supabase Dashboard
echo 2. SQL Editor
echo 3. Copia y pega el contenido del archivo:
echo    supabase/migrations/20240320000010_create_get_all_users_with_emails.sql
echo 4. Ejecuta la consulta
echo.
pause 