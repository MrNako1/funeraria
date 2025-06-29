const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 PROBANDO FUNCIONES CON EMAILS REALES')
console.log('========================================')
console.log()

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('❌ Variables de entorno no configuradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testEmailFunctions() {
  try {
    console.log('🔄 Probando funciones que obtienen emails reales...')
    console.log()
    
    // Lista de funciones a probar
    const functions = [
      'get_all_users_with_emails',
      'get_users_via_view',
      'get_users_with_emails',
      'get_users_with_roles',
      'get_users_simple'
    ]
    
    for (const funcName of functions) {
      try {
        console.log(`📞 Probando ${funcName}...`)
        const { data, error } = await supabase.rpc(funcName)
        
        if (error) {
          console.log(`❌ ${funcName} falló:`, error.message)
        } else {
          console.log(`✅ ${funcName} exitosa:`, data?.length || 0, 'usuarios')
          if (data && data.length > 0) {
            console.log('📧 Emails obtenidos:')
            data.forEach((user, index) => {
              console.log(`  ${index + 1}. ${user.email} (${user.role})`)
            })
          }
        }
        console.log()
        
      } catch (e) {
        console.log(`❌ ${funcName} error:`, e.message)
        console.log()
      }
    }
    
    // Resumen
    console.log('📋 RESUMEN:')
    console.log('- get_all_users_with_emails: Nueva función con emails reales')
    console.log('- get_users_via_view: Función alternativa con emails reales')
    console.log('- get_users_with_emails: Función anterior (puede fallar)')
    console.log('- get_users_with_roles: Función básica')
    console.log('- get_users_simple: Función de respaldo')
    
  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

testEmailFunctions() 