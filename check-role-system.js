const { createClient } = require('@supabase/supabase-js')

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Faltan las variables de entorno de Supabase')
  console.log('Asegúrate de tener configuradas:')
  console.log('- NEXT_PUBLIC_SUPABASE_URL')
  console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkRoleSystem() {
  try {
    console.log('🔍 Verificando sistema de roles...\n')
    
    // Verificar si la tabla user_roles existe
    console.log('1. Verificando tabla user_roles...')
    const { data: tableInfo, error: tableError } = await supabase
      .from('user_roles')
      .select('*')
      .limit(1)
    
    if (tableError) {
      console.error('❌ Error accediendo a user_roles:', tableError)
      return
    }
    
    console.log('✅ Tabla user_roles accesible')
    
    // Verificar políticas
    console.log('\n2. Verificando políticas...')
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_policies_info')
      .catch(() => ({ data: null, error: 'Función no disponible' }))
    
    if (policiesError) {
      console.log('⚠️ No se pueden verificar políticas automáticamente')
    } else {
      console.log('✅ Políticas verificadas')
    }
    
    // Verificar función assign_user_role
    console.log('\n3. Verificando función assign_user_role...')
    const { data: functionTest, error: functionError } = await supabase
      .rpc('assign_user_role', {
        user_uuid: '00000000-0000-0000-0000-000000000000',
        user_role: 'test'
      })
      .catch(() => ({ data: null, error: 'Función no disponible' }))
    
    if (functionError && functionError.message.includes('Función no disponible')) {
      console.log('❌ Función assign_user_role no está disponible')
    } else if (functionError) {
      console.log('⚠️ Función assign_user_role tiene errores:', functionError.message)
    } else {
      console.log('✅ Función assign_user_role disponible')
    }
    
    // Verificar usuarios existentes
    console.log('\n4. Verificando usuarios existentes...')
    const { data: users, error: usersError } = await supabase
      .from('user_roles')
      .select('*')
      .limit(5)
    
    if (usersError) {
      console.error('❌ Error obteniendo usuarios:', usersError)
    } else {
      console.log(`✅ ${users.length} usuarios encontrados en user_roles`)
      users.forEach(user => {
        console.log(`   - ${user.user_id.slice(0, 8)}... → ${user.role}`)
      })
    }
    
    console.log('\n📋 Resumen del sistema:')
    console.log('- Tabla user_roles: ✅ Accesible')
    console.log('- Políticas: ⚠️ Verificar manualmente')
    console.log('- Función RPC: ⚠️ Verificar manualmente')
    console.log('- Usuarios: ✅ Encontrados')
    
    console.log('\n💡 Recomendaciones:')
    console.log('1. Ejecuta el script fix-admin-policies.sql en Supabase SQL Editor')
    console.log('2. Verifica que la función assign_user_role existe')
    console.log('3. Prueba cambiar un rol desde la interfaz web')
    
  } catch (error) {
    console.error('❌ Error verificando sistema:', error)
  }
}

checkRoleSystem() 