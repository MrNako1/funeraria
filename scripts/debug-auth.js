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

async function debugAuth() {
  try {
    console.log('🔍 Debuggeando autenticación y carga de usuarios...')
    console.log('===============================================')
    
    // 1. Verificar sesión actual
    console.log('\n1. Verificando sesión actual...')
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('❌ Error obteniendo sesión:', sessionError)
    } else if (session) {
      console.log('✅ Sesión encontrada:')
      console.log('- Usuario:', session.user.email)
      console.log('- ID:', session.user.id)
      console.log('- Creado:', session.user.created_at)
    } else {
      console.log('❌ No hay sesión activa')
    }
    
    // 2. Verificar tabla user_roles
    console.log('\n2. Verificando tabla user_roles...')
    const { data: rolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
    
    if (rolesError) {
      console.error('❌ Error accediendo a user_roles:', rolesError)
      console.log('Detalles del error:', {
        message: rolesError.message,
        code: rolesError.code,
        details: rolesError.details,
        hint: rolesError.hint
      })
    } else {
      console.log('✅ Tabla user_roles accesible')
      console.log('📊 Registros encontrados:', rolesData?.length || 0)
      
      if (rolesData && rolesData.length > 0) {
        console.log('📋 Primeros 3 registros:')
        rolesData.slice(0, 3).forEach((role, index) => {
          console.log(`  ${index + 1}. user_id: ${role.user_id}, role: ${role.role}`)
        })
      }
    }
    
    // 3. Verificar políticas RLS
    console.log('\n3. Verificando políticas RLS...')
    try {
      const { data: policies, error: policiesError } = await supabase
        .from('user_roles')
        .select('count')
        .limit(1)
      
      if (policiesError) {
        console.error('❌ Error con políticas RLS:', policiesError)
      } else {
        console.log('✅ Políticas RLS permiten acceso')
      }
    } catch (policyError) {
      console.error('❌ Error verificando políticas:', policyError)
    }
    
    // 4. Verificar función personalizada (si existe)
    console.log('\n4. Verificando función get_users_with_roles...')
    try {
      const { data: functionData, error: functionError } = await supabase
        .rpc('get_users_with_roles')
      
      if (functionError) {
        console.error('❌ Error con función personalizada:', functionError)
      } else {
        console.log('✅ Función personalizada funciona')
        console.log('📊 Datos devueltos:', functionData?.length || 0)
      }
    } catch (funcError) {
      console.error('❌ Error ejecutando función:', funcError)
    }
    
    // 5. Verificar configuración de Supabase
    console.log('\n5. Verificando configuración...')
    console.log('- URL:', supabaseUrl)
    console.log('- Anon Key configurado:', !!supabaseAnonKey)
    console.log('- Cliente creado:', !!supabase)
    
    console.log('\n===============================================')
    console.log('✅ Debug completado')
    
  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

debugAuth() 