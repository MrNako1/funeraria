const { createClient } = require('@supabase/supabase-js')

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Faltan las variables de entorno de Supabase')
  console.log('Asegúrate de tener configuradas:')
  console.log('- NEXT_PUBLIC_SUPABASE_URL')
  console.log('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testRoleUpdate() {
  try {
    console.log('🧪 Probando función assign_user_role...')
    
    // Obtener lista de usuarios
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers()
    
    if (usersError) {
      throw usersError
    }
    
    if (users.users.length === 0) {
      console.log('❌ No hay usuarios para probar')
      return
    }
    
    const testUser = users.users[0]
    console.log(`👤 Usuario de prueba: ${testUser.email} (ID: ${testUser.id})`)
    
    // Verificar rol actual
    const { data: currentRole, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', testUser.id)
      .maybeSingle()
    
    console.log(`📊 Rol actual: ${currentRole?.role || 'user'}`)
    
    // Probar la función RPC
    console.log('🔄 Probando función RPC assign_user_role...')
    const { error: rpcError } = await supabase
      .rpc('assign_user_role', {
        user_uuid: testUser.id,
        user_role: 'cliente'
      })
    
    if (rpcError) {
      console.error('❌ Error en función RPC:', rpcError)
      return
    }
    
    console.log('✅ Función RPC ejecutada sin errores')
    
    // Verificar si el rol se actualizó
    const { data: newRole, error: newRoleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', testUser.id)
      .maybeSingle()
    
    if (newRoleError) {
      console.error('❌ Error verificando nuevo rol:', newRoleError)
      return
    }
    
    console.log(`📊 Nuevo rol: ${newRole?.role || 'user'}`)
    
    if (newRole?.role === 'cliente') {
      console.log('✅ Rol actualizado correctamente')
    } else {
      console.log('❌ Rol no se actualizó correctamente')
    }
    
  } catch (error) {
    console.error('❌ Error en prueba:', error)
  }
}

async function testDirectUpsert() {
  try {
    console.log('\n🧪 Probando upsert directo...')
    
    // Obtener lista de usuarios
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers()
    
    if (usersError) {
      throw usersError
    }
    
    if (users.users.length === 0) {
      console.log('❌ No hay usuarios para probar')
      return
    }
    
    const testUser = users.users[1] || users.users[0]
    console.log(`👤 Usuario de prueba: ${testUser.email} (ID: ${testUser.id})`)
    
    // Probar upsert directo
    const { error: upsertError } = await supabase
      .from('user_roles')
      .upsert({
        user_id: testUser.id,
        role: 'admin'
      }, {
        onConflict: 'user_id'
      })
    
    if (upsertError) {
      console.error('❌ Error en upsert directo:', upsertError)
    } else {
      console.log('✅ Upsert directo funcionó correctamente')
    }
    
  } catch (error) {
    console.error('❌ Error en prueba de upsert:', error)
  }
}

// Ejecutar pruebas
async function runTests() {
  console.log('🚀 Iniciando pruebas de actualización de roles...\n')
  
  await testRoleUpdate()
  await testDirectUpsert()
  
  console.log('\n🏁 Pruebas completadas')
}

runTests() 