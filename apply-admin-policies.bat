@echo off
echo ========================================
echo   Aplicar Políticas de Administrador
echo ========================================
echo.

echo Aplicando migración para corregir políticas de roles...
echo.

supabase db push

echo.
echo ✅ Migración aplicada exitosamente
echo.
echo Las políticas ahora permiten que los administradores:
echo - Vean todos los roles de usuario
echo - Inserten roles para cualquier usuario
echo - Actualicen roles de cualquier usuario
echo - Eliminen roles de cualquier usuario
echo.
pause 