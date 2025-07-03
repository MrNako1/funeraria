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
    storageKey: 'supabase.auth.token',
    debug: true
  }
})

async function testSessionPersistence() {
  console.log('🧪 Iniciando prueba de persistencia de sesión...')
  console.log('================================================')
  
  try {
    // Verificar sesión actual
    console.log('\n📊 Verificando sesión actual...')
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('❌ Error obteniendo sesión:', error)
      return
    }
    
    if (session) {
      console.log('✅ Sesión encontrada:', session.user.email)
      console.log('📅 Expira en:', new Date(session.expires_at * 1000).toLocaleString())
      console.log('🆔 User ID:', session.user.id)
      console.log('🔑 Access Token:', session.access_token ? 'Presente' : 'Ausente')
      console.log('🔄 Refresh Token:', session.refresh_token ? 'Presente' : 'Ausente')
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
      
      if (localStorageToken) {
        try {
          const parsedToken = JSON.parse(localStorageToken)
          console.log('📋 Token parseado correctamente')
          console.log('⏰ Expira en:', new Date(parsedToken.expires_at * 1000).toLocaleString())
        } catch (parseError) {
          console.error('❌ Error parseando token:', parseError)
        }
      }
    } else {
      console.log('⚠️ No estamos en el navegador')
    }
    
    // Verificar configuración de Supabase
    console.log('\n⚙️ Verificando configuración de Supabase...')
    console.log('   - persistSession: true')
    console.log('   - autoRefreshToken: true')
    console.log('   - detectSessionInUrl: true')
    console.log('   - flowType: pkce')
    console.log('   - storageKey: supabase.auth.token')
    console.log('   - debug: true')
    
    console.log('\n✅ Prueba completada')
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error)
  }
}

// Ejecutar la prueba
testSessionPersistence() 