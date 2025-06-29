@echo off
echo Haciendo administrador al usuario nicolas.ossandon7@gmail.com...
echo.

REM Verificar si supabase CLI está instalado
supabase --version >nul 2>&1
if errorlevel 1 (
    echo Error: Supabase CLI no está instalado
    echo Instala Supabase CLI con: npm install -g supabase
    pause
    exit /b 1
)

REM Ejecutar el script SQL
echo Ejecutando script SQL...
supabase db reset --linked

echo.
echo Si el comando anterior no funcionó, ejecuta manualmente este SQL en la consola de Supabase:
echo.
echo UPDATE public.user_roles SET role = 'admin' WHERE user_id = (SELECT id FROM auth.users WHERE email = 'nicolas.ossandon7@gmail.com');
echo.
echo O si el usuario no tiene rol asignado:
echo.
echo INSERT INTO public.user_roles (user_id, role) VALUES ((SELECT id FROM auth.users WHERE email = 'nicolas.ossandon7@gmail.com'), 'admin');
echo.
pause 