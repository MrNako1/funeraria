const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Faltan las variables de entorno de Supabase')
  console.log('📝 Crea un archivo .env.local con NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storageKey: 'supabase.auth.token'
  }
})

async function clearAllSessions() {
  console.log('🧹 Limpiando todas las sesiones...')
  console.log('=====================================')
  
  try {
    // Verificar sesión actual antes de limpiar
    console.log('\n📊 Verificando sesión actual...')
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('❌ Error obteniendo sesión:', error)
    } else if (session) {
      console.log('✅ Sesión activa encontrada:', session.user.email)
      console.log('📅 Expira en:', new Date(session.expires_at * 1000).toLocaleString())
    } else {
      console.log('📭 No hay sesión activa')
    }
    
    // Cerrar sesión en Supabase
    console.log('\n🔄 Cerrando sesión en Supabase...')
    const { error: signOutError } = await supabase.auth.signOut()
    
    if (signOutError) {
      console.error('❌ Error cerrando sesión:', signOutError)
    } else {
      console.log('✅ Sesión cerrada en Supabase')
    }
    
    // Verificar que la sesión se cerró
    console.log('\n🔍 Verificando que la sesión se cerró...')
    const { data: { session: sessionAfter }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('❌ Error verificando sesión después del cierre:', sessionError)
    } else if (sessionAfter) {
      console.log('⚠️  La sesión aún está activa después del cierre')
    } else {
      console.log('✅ Sesión cerrada correctamente')
    }
    
    console.log('\n✅ Limpieza completada')
    console.log('\n💡 Para limpiar completamente en el navegador:')
    console.log('1. Abre las herramientas de desarrollador (F12)')
    console.log('2. Ve a Application/Storage')
    console.log('3. Limpia Local Storage y Session Storage')
    console.log('4. Elimina las cookies del dominio')
    console.log('5. Recarga la página')
    
  } catch (error) {
    console.error('❌ Error en la limpieza:', error)
  }
}

// Función para limpiar solo sesiones activas
async function clearActiveSessions() {
  console.log('🧹 Limpiando solo sesiones activas...')
  console.log('=====================================')
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('❌ Error obteniendo sesión:', error)
      return
    }
    
    if (session) {
      console.log('✅ Sesión activa encontrada:', session.user.email)
      await clearAllSessions()
    } else {
      console.log('📭 No hay sesiones activas para limpiar')
    }
    
  } catch (error) {
    console.error('❌ Error limpiando sesiones activas:', error)
  }
}

// Obtener argumento de línea de comandos
const args = process.argv.slice(2)
const mode = args[0] || 'all'

if (mode === 'active') {
  clearActiveSessions()
} else {
  clearAllSessions()
} 