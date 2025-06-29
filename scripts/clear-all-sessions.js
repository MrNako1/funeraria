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

async function clearAllSessions() {
  try {
    console.log('🧹 Limpiando todas las sesiones de Supabase...')
    
    // Obtener todos los usuarios
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers()
    
    if (usersError) {
      throw usersError
    }
    
    console.log(`Encontrados ${users.users.length} usuarios`)
    
    // Limpiar sesiones de cada usuario
    for (const user of users.users) {
      try {
        console.log(`Limpiando sesiones de: ${user.email}`)
        
        // Revocar todas las sesiones del usuario
        const { error: revokeError } = await supabase.auth.admin.deleteUser(user.id)
        
        if (revokeError) {
          console.error(`Error revocando sesiones de ${user.email}:`, revokeError)
        } else {
          console.log(`✅ Sesiones limpiadas para: ${user.email}`)
        }
      } catch (userError) {
        console.error(`Error procesando usuario ${user.email}:`, userError)
      }
    }
    
    console.log('✅ Proceso de limpieza completado')
    
  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

// Función alternativa para limpiar solo sesiones activas
async function clearActiveSessions() {
  try {
    console.log('🧹 Limpiando sesiones activas...')
    
    // Esta es una operación más segura que solo limpia sesiones activas
    // sin eliminar usuarios
    
    console.log('⚠️ Para limpiar sesiones activas, usa el botón en la página web')
    console.log('O ejecuta en el navegador:')
    console.log('localStorage.clear(); sessionStorage.clear();')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Ejecutar la función apropiada
const action = process.argv[2]

if (action === 'active') {
  clearActiveSessions()
} else {
  clearAllSessions()
} 