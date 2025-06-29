const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 DEBUG: Verificando configuración de usuarios')
console.log('===============================================')
console.log()

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('❌ ERROR: Variables de entorno no configuradas')
  console.log('URL:', supabaseUrl ? '✅ Configurada' : '❌ Faltante')
  console.log('Key:', supabaseAnonKey ? '✅ Configurada' : '❌ Faltante')
  console.log()
  console.log('🔧 SOLUCIÓN:')
  console.log('1. Crea un archivo .env.local en la raíz del proyecto')
  console.log('2. Agrega las variables de Supabase')
  console.log('3. Reinicia el servidor')
  process.exit(1)
}

console.log('✅ Variables de entorno configuradas')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseAnonKey.substring(0, 20) + '...')
console.log()

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function debugUsers() {
  try {
    console.log('🔄 Conectando a Supabase...')
    
    // 1. Verificar conexión básica
    const { data: testData, error: testError } = await supabase
      .from('user_roles')
      .select('count')
      .limit(1)
    
    if (testError) {
      console.log('❌ Error de conexión:', testError)
      return
    }
    
    console.log('✅ Conexión exitosa')
    console.log()
    
    // 2. Verificar usuarios en user_roles
    console.log('📊 Verificando tabla user_roles...')
    const { data: rolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
    
    if (rolesError) {
      console.log('❌ Error obteniendo roles:', rolesError)
    } else {
      console.log('✅ Usuarios en user_roles:', rolesData.length)
      rolesData.forEach((role, index) => {
        console.log(`  ${index + 1}. ID: ${role.user_id}, Rol: ${role.role}`)
      })
    }
    console.log()
    
    // 3. Probar función get_users_simple
    console.log('🔄 Probando función get_users_simple...')
    const { data: simpleData, error: simpleError } = await supabase
      .rpc('get_users_simple')
    
    if (simpleError) {
      console.log('❌ Error en get_users_simple:', simpleError)
    } else {
      console.log('✅ get_users_simple exitosa:', simpleData?.length || 0, 'usuarios')
      if (simpleData) {
        simpleData.forEach((user, index) => {
          console.log(`  ${index + 1}. ${user.email} (${user.role})`)
        })
      }
    }
    console.log()
    
    // 4. Probar función get_users_with_emails
    console.log('🔄 Probando función get_users_with_emails...')
    const { data: emailsData, error: emailsError } = await supabase
      .rpc('get_users_with_emails')
    
    if (emailsError) {
      console.log('❌ Error en get_users_with_emails:', emailsError)
    } else {
      console.log('✅ get_users_with_emails exitosa:', emailsData?.length || 0, 'usuarios')
      if (emailsData) {
        emailsData.forEach((user, index) => {
          console.log(`  ${index + 1}. ${user.email} (${user.role})`)
        })
      }
    }
    console.log()
    
    // 5. Probar función get_users_with_roles
    console.log('🔄 Probando función get_users_with_roles...')
    const { data: rolesFuncData, error: rolesFuncError } = await supabase
      .rpc('get_users_with_roles')
    
    if (rolesFuncError) {
      console.log('❌ Error en get_users_with_roles:', rolesFuncError)
    } else {
      console.log('✅ get_users_with_roles exitosa:', rolesFuncData?.length || 0, 'usuarios')
      if (rolesFuncData) {
        rolesFuncData.forEach((user, index) => {
          console.log(`  ${index + 1}. ${user.email} (${user.role})`)
        })
      }
    }
    console.log()
    
    // 6. Resumen
    console.log('📋 RESUMEN:')
    console.log('- Usuarios en user_roles:', rolesData?.length || 0)
    console.log('- get_users_simple funciona:', !simpleError)
    console.log('- get_users_with_emails funciona:', !emailsError)
    console.log('- get_users_with_roles funciona:', !rolesFuncError)
    
  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

debugUsers() 