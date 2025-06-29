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

async function assignClienteRole(email) {
  try {
    console.log(`🔄 Asignando rol cliente a: ${email}`)
    
    // Obtener el ID del usuario por email
    const { data: user, error: userError } = await supabase.auth.admin.listUsers()
    
    if (userError) {
      throw userError
    }
    
    const targetUser = user.users.find(u => u.email === email)
    
    if (!targetUser) {
      console.error(`❌ Usuario no encontrado: ${email}`)
      return
    }
    
    console.log(`✅ Usuario encontrado: ${targetUser.email} (ID: ${targetUser.id})`)
    
    // Insertar o actualizar el rol cliente
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .upsert({
        user_id: targetUser.id,
        role: 'cliente'
      }, {
        onConflict: 'user_id'
      })
    
    if (roleError) {
      throw roleError
    }
    
    console.log(`✅ Rol cliente asignado exitosamente a: ${email}`)
    
  } catch (error) {
    console.error('❌ Error asignando rol cliente:', error)
  }
}

async function listAllUsers() {
  try {
    console.log('📋 Listando todos los usuarios...')
    
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers()
    
    if (usersError) {
      throw usersError
    }
    
    console.log(`\n📊 Total de usuarios: ${users.users.length}`)
    
    users.users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (ID: ${user.id.slice(0, 8)}...)`)
    })
    
  } catch (error) {
    console.error('❌ Error listando usuarios:', error)
  }
}

// Obtener el email del argumento de línea de comandos
const email = process.argv[2]

if (email) {
  assignClienteRole(email)
} else {
  console.log('📋 Para asignar rol cliente, usa:')
  console.log('node scripts/assign-cliente-role.js "usuario@email.com"')
  console.log('\n📋 Listando todos los usuarios disponibles:')
  listAllUsers()
} 