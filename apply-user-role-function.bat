@echo off
echo Aplicando función assign_user_role...

REM Ejecutar la migración SQL
echo Ejecutando migración SQL...
sqlcmd -S localhost -d postgres -U postgres -P postgres -i supabase\migrations\20240320000011_create_assign_user_role_function.sql

if %ERRORLEVEL% EQU 0 (
    echo ✅ Función assign_user_role aplicada exitosamente
) else (
    echo ❌ Error aplicando la función
    pause
) 