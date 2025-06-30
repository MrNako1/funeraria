const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno de Supabase no encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function applyAdminInsertPolicy() {
  console.log('🔧 Aplicando política RLS de INSERT para administradores...')
  
  try {
    // Intentar crear la política usando SQL directo
    console.log('\n1️⃣ Intentando crear política con SQL directo...')
    
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Crear política de INSERT para administradores
        CREATE POLICY IF NOT EXISTS "Admins can insert any favorites" ON public.memorial_favorites
        FOR INSERT WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.user_roles 
                WHERE user_id = auth.uid() AND role = 'admin'
            )
        );
      `
    })

    if (error) {
      console.log('⚠️ No se pudo ejecutar SQL directamente')
      console.log('Error:', error.message)
      
      // Método alternativo: verificar si la política ya existe
      console.log('\n2️⃣ Verificando políticas existentes...')
      const { data: policies, error: policiesError } = await supabase
        .from('information_schema.policies')
        .select('policy_name')
        .eq('table_name', 'memorial_favorites')
        .eq('table_schema', 'public')
      
      if (policiesError) {
        console.log('⚠️ No se pudieron verificar las políticas')
        console.log('Error:', policiesError.message)
      } else {
        console.log('✅ Políticas encontradas:')
        policies.forEach(policy => {
          console.log(`   - ${policy.policy_name}`)
        })
        
        const hasAdminInsert = policies.some(p => p.policy_name === 'Admins can insert any favorites')
        if (hasAdminInsert) {
          console.log('✅ La política "Admins can insert any favorites" ya existe')
        } else {
          console.log('❌ La política "Admins can insert any favorites" NO existe')
        }
      }
      
      console.log('\n📋 Instrucciones manuales:')
      console.log('1. Ve a tu proyecto Supabase Dashboard')
      console.log('2. Navega a Authentication > Policies')
      console.log('3. Busca la tabla memorial_favorites')
      console.log('4. Haz clic en "New Policy"')
      console.log('5. Configura:')
      console.log('   - Nombre: "Admins can insert any favorites"')
      console.log('   - Target roles: "authenticated"')
      console.log('   - Using expression: EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = \'admin\')')
      console.log('   - Policy definition: INSERT')
      console.log('6. Guarda la política')
      console.log('7. Prueba el botón de favoritos')
      
    } else {
      console.log('✅ Política RLS creada exitosamente')
    }

    // Verificar memoriales disponibles para prueba
    console.log('\n3️⃣ Verificando memoriales para prueba...')
    const { data: memorials, error: memorialsError } = await supabase
      .from('plantillas')
      .select('id, primer_nombre, apellido_paterno')
      .limit(1)
    
    if (memorialsError) {
      console.error('❌ Error al obtener memoriales:', memorialsError)
    } else if (memorials && memorials.length > 0) {
      console.log(`✅ Memorial disponible para prueba: ${memorials[0].primer_nombre} ${memorials[0].apellido_paterno}`)
      console.log(`   ID: ${memorials[0].id}`)
    }

  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

// Ejecutar aplicación de política
applyAdminInsertPolicy() 