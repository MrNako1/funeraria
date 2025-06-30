const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno de Supabase no encontradas')
  console.log('Verifica tu archivo .env.local:')
  console.log('NEXT_PUBLIC_SUPABASE_URL=tu_url')
  console.log('SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key (opcional)')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function applyPolicyDirectly() {
  console.log('🔧 Aplicando política RLS directamente...')
  
  try {
    // Método 1: Intentar con SQL directo usando service role
    console.log('\n1️⃣ Intentando con SQL directo...')
    
    const { data, error } = await supabase
      .from('memorial_favorites')
      .select('id')
      .limit(1)
    
    if (error) {
      console.log('❌ Error al acceder a la tabla:', error.message)
    } else {
      console.log('✅ Acceso a tabla memorial_favorites exitoso')
    }

    // Método 2: Verificar políticas existentes usando pg_policies
    console.log('\n2️⃣ Verificando políticas existentes...')
    
    try {
      const { data: policies, error: policiesError } = await supabase
        .rpc('get_policies', { table_name: 'memorial_favorites' })
      
      if (policiesError) {
        console.log('⚠️ No se pudo obtener políticas con RPC')
        console.log('Error:', policiesError.message)
      } else {
        console.log('✅ Políticas encontradas:')
        policies.forEach(policy => {
          console.log(`   - ${policy.policyname}`)
        })
      }
    } catch (rpcError) {
      console.log('⚠️ RPC get_policies no disponible')
    }

    // Método 3: Probar inserción para verificar políticas actuales
    console.log('\n3️⃣ Probando inserción para diagnosticar...')
    
    const testUserId = '00000000-0000-0000-0000-000000000000'
    const testMemorialId = '00000000-0000-0000-0000-000000000000'
    
    const { error: insertError } = await supabase
      .from('memorial_favorites')
      .insert({
        user_id: testUserId,
        memorial_id: testMemorialId
      })
    
    if (insertError) {
      console.log('✅ Políticas RLS funcionando (inserción bloqueada)')
      console.log('   Error esperado:', insertError.message)
      
      if (insertError.message.includes('row-level security policy')) {
        console.log('\n🔍 Diagnóstico:')
        console.log('   - Las políticas RLS están activas')
        console.log('   - La inserción está siendo bloqueada')
        console.log('   - Probablemente falta la política de INSERT para admins')
      }
    } else {
      console.log('⚠️ Políticas RLS no están funcionando correctamente')
    }

    // Instrucciones finales
    console.log('\n📋 SOLUCIÓN MANUAL REQUERIDA:')
    console.log('1. Ve a tu proyecto Supabase Dashboard')
    console.log('2. Navega a Authentication > Policies')
    console.log('3. Busca la tabla memorial_favorites')
    console.log('4. Haz clic en "New Policy"')
    console.log('5. Configura la nueva política:')
    console.log('   - Nombre: "Admins can insert any favorites"')
    console.log('   - Target roles: "authenticated"')
    console.log('   - Using expression: EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = \'admin\')')
    console.log('   - Policy definition: INSERT')
    console.log('6. Guarda la política')
    console.log('7. Prueba el botón de favoritos en tu aplicación')
    
    console.log('\n🔧 Verificación de configuración:')
    console.log(`   Supabase URL: ${supabaseUrl ? '✅ Configurada' : '❌ Faltante'}`)
    console.log(`   Service Role Key: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Configurada' : '❌ Faltante (usando anon key)'}`)
    console.log(`   Anon Key: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ Faltante'}`)

  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

// Ejecutar aplicación de política
applyPolicyDirectly() 