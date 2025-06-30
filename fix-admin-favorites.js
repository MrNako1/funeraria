const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno de Supabase no encontradas')
  console.log('Verifica tu archivo .env.local:')
  console.log('NEXT_PUBLIC_SUPABASE_URL=tu_url')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixAdminFavoritesPolicies() {
  console.log('🔧 Corrigiendo políticas RLS para administradores...')
  
  try {
    // 1. Verificar conexión
    console.log('\n1️⃣ Verificando conexión a Supabase...')
    const { data: testData, error: testError } = await supabase
      .from('user_roles')
      .select('id')
      .limit(1)
    
    if (testError) {
      console.error('❌ Error de conexión:', testError)
      return
    }
    console.log('✅ Conexión a Supabase exitosa')

    // 2. Verificar tabla memorial_favorites
    console.log('\n2️⃣ Verificando tabla memorial_favorites...')
    const { data: tableData, error: tableError } = await supabase
      .from('memorial_favorites')
      .select('id')
      .limit(1)
    
    if (tableError) {
      console.error('❌ Error con tabla memorial_favorites:', tableError)
      console.log('\n🔧 Solución:')
      console.log('1. Ejecuta: ./apply-memorial-favorites.bat')
      console.log('2. O manualmente: npx supabase db push')
      return
    }
    console.log('✅ Tabla memorial_favorites existe y es accesible')

    // 3. Probar inserción como usuario normal (debería fallar sin autenticación)
    console.log('\n3️⃣ Probando inserción sin autenticación...')
    const { error: insertError } = await supabase
      .from('memorial_favorites')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000',
        memorial_id: '00000000-0000-0000-0000-000000000000'
      })
    
    if (insertError) {
      console.log('✅ Políticas RLS funcionando (inserción bloqueada sin auth)')
      console.log('   Error esperado:', insertError.message)
    } else {
      console.log('⚠️ Políticas RLS no están funcionando correctamente')
    }

    // 4. Verificar memoriales disponibles
    console.log('\n4️⃣ Verificando memoriales disponibles...')
    const { data: memorials, error: memorialsError } = await supabase
      .from('plantillas')
      .select('id, primer_nombre, apellido_paterno')
      .limit(3)
    
    if (memorialsError) {
      console.error('❌ Error al obtener memoriales:', memorialsError)
      return
    }
    
    if (!memorials || memorials.length === 0) {
      console.log('⚠️ No hay memoriales disponibles')
      console.log('Crea algunos memoriales primero')
      return
    }
    
    console.log(`✅ Encontrados ${memorials.length} memoriales`)
    memorials.forEach((memorial, index) => {
      console.log(`   ${index + 1}. ${memorial.primer_nombre} ${memorial.apellido_paterno} (ID: ${memorial.id})`)
    })

    // 5. Instrucciones para verificar manualmente
    console.log('\n📋 Instrucciones para verificar manualmente:')
    console.log('1. Ve a tu proyecto Supabase Dashboard')
    console.log('2. Navega a Authentication > Policies')
    console.log('3. Busca la tabla memorial_favorites')
    console.log('4. Verifica que existan estas políticas:')
    console.log('   - Users can view their own favorites')
    console.log('   - Users can insert their own favorites')
    console.log('   - Users can delete their own favorites')
    console.log('   - Admins can view all favorites')
    console.log('   - Admins can insert any favorites ← IMPORTANTE')
    console.log('   - Admins can delete any favorites')
    console.log('')
    console.log('5. Si falta "Admins can insert any favorites":')
    console.log('   - Haz clic en "New Policy"')
    console.log('   - Nombre: "Admins can insert any favorites"')
    console.log('   - Target roles: "authenticated"')
    console.log('   - Using expression: EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = \'admin\')')
    console.log('   - Policy definition: INSERT')
    console.log('')
    console.log('6. Prueba el botón de favoritos nuevamente')

    // 6. Verificar variables de entorno
    console.log('\n🔧 Verificación de configuración:')
    console.log(`   Supabase URL: ${supabaseUrl ? '✅ Configurada' : '❌ Faltante'}`)
    console.log(`   Supabase Key: ${supabaseKey ? '✅ Configurada' : '❌ Faltante'}`)

  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

// Ejecutar corrección
fixAdminFavoritesPolicies() 