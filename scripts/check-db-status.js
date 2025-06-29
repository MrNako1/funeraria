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

async function checkDatabaseStatus() {
  try {
    console.log('🔍 Verificando estado de la base de datos...')
    console.log('=====================================')
    
    // 1. Verificar si la tabla user_roles existe
    console.log('\n1. Verificando tabla user_roles...')
    const { data: rolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
      .limit(5)
    
    if (rolesError) {
      console.error('❌ Error accediendo a user_roles:', rolesError)
    } else {
      console.log('✅ Tabla user_roles accesible')
      console.log('📊 Datos en user_roles:', rolesData?.length || 0, 'registros')
      if (rolesData && rolesData.length > 0) {
        console.log('📋 Ejemplo de registro:', rolesData[0])
      }
    }
    
    // 2. Verificar si la función get_users_with_roles existe
    console.log('\n2. Verificando función get_users_with_roles...')
    try {
      const { data: functionData, error: functionError } = await supabase
        .rpc('get_users_with_roles')
      
      if (functionError) {
        console.error('❌ Error con función get_users_with_roles:', functionError)
      } else {
        console.log('✅ Función get_users_with_roles funciona')
        console.log('📊 Datos devueltos:', functionData?.length || 0, 'usuarios')
        if (functionData && functionData.length > 0) {
          console.log('📋 Ejemplo de usuario:', functionData[0])
        }
      }
    } catch (funcError) {
      console.error('❌ Error ejecutando función:', funcError)
    }
    
    // 3. Verificar usuarios en auth.users
    console.log('\n3. Verificando usuarios en auth.users...')
    try {
      const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers()
      
      if (usersError) {
        console.error('❌ Error listando usuarios:', usersError)
      } else {
        console.log('✅ Usuarios en auth.users:', usersData.users.length)
        if (usersData.users.length > 0) {
          console.log('📋 Primer usuario:', {
            id: usersData.users[0].id,
            email: usersData.users[0].email,
            created_at: usersData.users[0].created_at
          })
        }
      }
    } catch (authError) {
      console.error('❌ Error accediendo a auth.users:', authError)
    }
    
    // 4. Verificar políticas de seguridad
    console.log('\n4. Verificando políticas de seguridad...')
    const { data: policies, error: policiesError } = await supabase
      .from('user_roles')
      .select('*')
    
    if (policiesError) {
      console.error('❌ Error verificando políticas:', policiesError)
    } else {
      console.log('✅ Políticas permiten acceso a user_roles')
    }
    
    console.log('\n=====================================')
    console.log('✅ Verificación completada')
    
  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

checkDatabaseStatus() 