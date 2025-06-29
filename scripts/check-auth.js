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

async function checkAuth() {
  try {
    console.log('🔍 Verificando estado de autenticación...')
    
    // Verificar sesión actual
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('❌ Error al obtener sesión:', sessionError)
      return
    }
    
    if (!session) {
      console.log('❌ No hay sesión activa')
      return
    }
    
    console.log('✅ Sesión activa encontrada')
    console.log('Usuario:', session.user.email)
    console.log('ID:', session.user.id)
    
    // Verificar rol del usuario
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .single()
    
    if (roleError) {
      console.error('❌ Error al obtener rol:', roleError)
      return
    }
    
    console.log('Rol:', roleData?.role || 'No asignado')
    console.log('Es Admin:', roleData?.role === 'admin' ? 'Sí' : 'No')
    
    // Probar la función get_users
    console.log('\n🔍 Probando función get_users...')
    const { data: users, error: usersError } = await supabase.rpc('get_users')
    
    if (usersError) {
      console.error('❌ Error en get_users:', usersError)
    } else {
      console.log('✅ get_users funcionó correctamente')
      console.log('Usuarios encontrados:', users?.length || 0)
    }
    
  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

checkAuth() 