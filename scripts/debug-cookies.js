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

async function debugCookies() {
  console.log('🔍 Diagnóstico de Cookies - Funeraria')
  console.log('=====================================')
  
  try {
    // Verificar sesión actual
    console.log('\n📊 Verificando sesión actual...')
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('❌ Error obteniendo sesión:', error)
    } else if (session) {
      console.log('✅ Sesión activa encontrada')
      console.log(`   Usuario: ${session.user.email}`)
      console.log(`   Expira: ${new Date(session.expires_at * 1000).toLocaleString()}`)
    } else {
      console.log('📭 No hay sesión activa')
    }
    
    // Verificar configuración de cookies
    console.log('\n🍪 Verificando configuración de cookies...')
    
    // Simular verificación de cookies del navegador
    console.log('⚠️  Nota: Este script se ejecuta en Node.js, no en el navegador')
    console.log('   Para verificar cookies en el navegador, usa la consola:')
    console.log('   document.cookie')
    
    // Verificar variables de entorno
    console.log('\n🔧 Verificando variables de entorno...')
    console.log(`   NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ Configurado' : '❌ Faltante'}`)
    console.log(`   NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅ Configurado' : '❌ Faltante'}`)
    
    // Verificar configuración de Supabase
    console.log('\n⚙️  Verificando configuración de Supabase...')
    console.log('   Configuración actual:')
    console.log('   - persistSession: true')
    console.log('   - autoRefreshToken: true')
    console.log('   - detectSessionInUrl: true')
    console.log('   - flowType: pkce')
    console.log('   - storageKey: supabase.auth.token')
    
    // Recomendaciones
    console.log('\n💡 Recomendaciones:')
    console.log('1. Verifica que las cookies estén habilitadas en el navegador')
    console.log('2. Asegúrate de que el dominio esté configurado correctamente')
    console.log('3. En producción, usa HTTPS para cookies seguras')
    console.log('4. Verifica que no haya bloqueadores de cookies activos')
    
    console.log('\n✅ Diagnóstico completado')
    
  } catch (error) {
    console.error('❌ Error en el diagnóstico:', error)
  }
}

// Función para verificar cookies específicas
function checkSpecificCookies() {
  console.log('\n🔍 Verificando cookies específicas...')
  
  const expectedCookies = [
    'sb-auth-token',
    'supabase.auth.token',
    'sb-access-token',
    'sb-refresh-token'
  ]
  
  expectedCookies.forEach(cookieName => {
    console.log(`   ${cookieName}: Verificar en el navegador`)
  })
  
  console.log('\n📝 Para verificar en el navegador, ejecuta:')
  console.log('   console.log(document.cookie)')
  console.log('   localStorage.getItem("supabase.auth.token")')
  console.log('   sessionStorage.getItem("supabase.auth.token")')
}

debugCookies()
checkSpecificCookies() 