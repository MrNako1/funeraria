const { createClient } = require('@supabase/supabase-js')

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Faltan las variables de entorno de Supabase')
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

async function testSessionPersistence() {
  console.log('🧪 Iniciando prueba de persistencia de sesión...')
  
  try {
    // Verificar sesión actual
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('❌ Error obteniendo sesión:', error)
      return
    }
    
    if (session) {
      console.log('✅ Sesión encontrada:', session.user.email)
      console.log('📅 Expira en:', new Date(session.expires_at * 1000).toLocaleString())
    } else {
      console.log('📭 No hay sesión activa')
    }
    
    // Verificar configuración de almacenamiento
    console.log('\n🔍 Verificando configuración de almacenamiento...')
    
    if (typeof window !== 'undefined') {
      const localStorageToken = localStorage.getItem('supabase.auth.token')
      const sessionStorageToken = sessionStorage.getItem('supabase.auth.token')
      
      console.log('📦 localStorage token:', localStorageToken ? 'Presente' : 'Ausente')
      console.log('📦 sessionStorage token:', sessionStorageToken ? 'Presente' : 'Ausente')
    } else {
      console.log('⚠️ No estamos en el navegador')
    }
    
    console.log('\n✅ Prueba completada')
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error)
  }
}

testSessionPersistence() 