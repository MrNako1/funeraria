@echo off
echo ========================================
echo   Corregir Restricción de Roles
echo ========================================
echo.

echo El error indica que la restricción de verificación no permite el rol "cliente".
echo.
echo Para solucionarlo:
echo.
echo 1. Ve al panel de administración de Supabase
echo 2. Navega a SQL Editor
echo 3. Copia y pega el contenido del archivo fix-role-constraint-simple.sql
echo 4. Ejecuta el script
echo.
echo RECOMENDADO: Usa fix-role-constraint-simple.sql (versión simple sin pruebas)
echo.
echo El script hará lo siguiente:
echo - Mostrará la restricción actual
echo - Eliminará la restricción existente
echo - Creará una nueva restricción que incluye 'cliente'
echo - Verificará que se aplicó correctamente
echo.
echo Después de ejecutar el script, el cambio de roles debería funcionar.
echo.

pause 