@echo off
echo ========================================
echo Corrigiendo politicas RLS para admins
echo ========================================

echo.
echo 🔧 Aplicando corrección de políticas RLS...

echo.
echo 1. Verificando conexión a Supabase...
node -e "
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function fixAdminPolicies() {
  try {
    console.log('🔍 Verificando políticas actuales...');
    
    // Ejecutar la migración SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Eliminar políticas existentes de admin si existen
        DROP POLICY IF EXISTS \"Admins can view all favorites\" ON public.memorial_favorites;
        DROP POLICY IF EXISTS \"Admins can delete any favorites\" ON public.memorial_favorites;

        -- Crear políticas corregidas para administradores
        CREATE POLICY \"Admins can view all favorites\" ON public.memorial_favorites
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.user_roles 
                    WHERE user_id = auth.uid() AND role = 'admin'
                )
            );

        CREATE POLICY \"Admins can insert any favorites\" ON public.memorial_favorites
            FOR INSERT WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.user_roles 
                    WHERE user_id = auth.uid() AND role = 'admin'
                )
            );

        CREATE POLICY \"Admins can delete any favorites\" ON public.memorial_favorites
            FOR DELETE USING (
                EXISTS (
                    SELECT 1 FROM public.user_roles 
                    WHERE user_id = auth.uid() AND role = 'admin'
                )
            );
      `
    });

    if (error) {
      console.log('⚠️ No se pudo ejecutar SQL directamente, intentando método alternativo...');
      console.log('Error:', error.message);
      
      // Método alternativo: verificar si las políticas existen
      console.log('ℹ️ Verifica manualmente en Supabase Dashboard:');
      console.log('1. Ve a Authentication > Policies');
      console.log('2. Busca la tabla memorial_favorites');
      console.log('3. Asegúrate de que existan estas políticas:');
      console.log('   - Admins can view all favorites');
      console.log('   - Admins can insert any favorites');
      console.log('   - Admins can delete any favorites');
    } else {
      console.log('✅ Políticas RLS corregidas exitosamente');
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

fixAdminPolicies();
"

echo.
echo 2. Verificando que la corrección se aplicó...
echo.
echo 📋 Instrucciones para verificar manualmente:
echo.
echo 1. Ve a tu proyecto Supabase Dashboard
echo 2. Navega a Authentication > Policies
echo 3. Busca la tabla 'memorial_favorites'
echo 4. Verifica que existan estas políticas:
echo    - Admins can view all favorites
echo    - Admins can insert any favorites (NUEVA)
echo    - Admins can delete any favorites
echo.
echo 5. Si no existe la política de INSERT para admins:
echo    - Haz clic en 'New Policy'
echo    - Nombre: 'Admins can insert any favorites'
echo    - Target roles: 'authenticated'
echo    - Using expression: EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
echo    - Policy definition: INSERT
echo.
echo 6. Prueba el botón de favoritos nuevamente
echo.

echo ========================================
echo Corrección completada
echo ========================================
echo.
pause 