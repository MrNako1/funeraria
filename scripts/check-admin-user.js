const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 VERIFICANDO USUARIO ADMIN')
console.log('============================')
console.log()

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('❌ Variables de entorno no configuradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkAdminUser() {
  try {
    console.log('🔄 Verificando usuario admin...')
    
    // Buscar el usuario por email
    const adminEmail = 'nicolas.ossandon7@gmail.com'
    
    console.log(`📧 Buscando usuario: ${adminEmail}`)
    
    // Intentar obtener el usuario de auth.users (esto puede no funcionar sin service role)
    try {
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
      if (!authError && authUsers) {
        const adminUser = authUsers.users.find(u => u.email === adminEmail)
        if (adminUser) {
          console.log('✅ Usuario encontrado en auth.users:', adminUser.id)
        } else {
          console.log('❌ Usuario no encontrado en auth.users')
        }
      }
    } catch (e) {
      console.log('⚠️ No se puede acceder a auth.users (normal sin service role)')
    }
    
    // Verificar en user_roles
    console.log('🔍 Verificando en tabla user_roles...')
    const { data: rolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
    
    if (rolesError) {
      console.log('❌ Error obteniendo roles:', rolesError)
      return
    }
    
    console.log('✅ Roles obtenidos:', rolesData.length, 'registros')
    
    if (rolesData.length === 0) {
      console.log('❌ No hay usuarios en user_roles')
      console.log('🔧 Creando usuario admin...')
      
      // Intentar crear el usuario admin
      const { error: createError } = await supabase
        .from('user_roles')
        .insert({
          user_id: '00000000-0000-0000-0000-000000000000', // Placeholder
          role: 'admin'
        })
      
      if (createError) {
        console.log('❌ Error creando usuario admin:', createError)
      } else {
        console.log('✅ Usuario admin creado (placeholder)')
      }
    } else {
      rolesData.forEach((role, index) => {
        console.log(`${index + 1}. ID: ${role.user_id}, Rol: ${role.role}`)
      })
      
      // Buscar si hay algún admin
      const adminUsers = rolesData.filter(r => r.role === 'admin')
      if (adminUsers.length > 0) {
        console.log('✅ Usuarios admin encontrados:', adminUsers.length)
        adminUsers.forEach(admin => {
          console.log(`  - ID: ${admin.user_id}, Rol: ${admin.role}`)
        })
      } else {
        console.log('❌ No hay usuarios con rol admin')
      }
    }
    
    // Probar funciones
    console.log()
    console.log('🔄 Probando funciones...')
    
    const functions = ['get_users_simple', 'get_users_with_emails', 'get_users_with_roles']
    
    for (const funcName of functions) {
      try {
        console.log(`📞 Probando ${funcName}...`)
        const { data, error } = await supabase.rpc(funcName)
        
        if (error) {
          console.log(`❌ ${funcName} falló:`, error.message)
        } else {
          console.log(`✅ ${funcName} exitosa:`, data?.length || 0, 'usuarios')
        }
      } catch (e) {
        console.log(`❌ ${funcName} error:`, e.message)
      }
    }
    
  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

checkAdminUser() 