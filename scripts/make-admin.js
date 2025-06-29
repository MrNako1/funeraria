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

async function makeUserAdmin(email) {
  try {
    console.log(`Buscando usuario con email: ${email}`)
    
    // Buscar el usuario por email
    const { data: users, error: userError } = await supabase.auth.admin.listUsers()
    
    if (userError) {
      throw userError
    }
    
    const user = users.users.find(u => u.email === email)
    
    if (!user) {
      console.error(`No se encontró un usuario con el email: ${email}`)
      return
    }
    
    console.log(`Usuario encontrado: ${user.email} (ID: ${user.id})`)
    
    // Verificar si ya existe un rol para este usuario
    const { data: existingRole, error: roleError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    if (roleError && roleError.code !== 'PGRST116') {
      throw roleError
    }
    
    if (existingRole) {
      // Actualizar el rol existente
      const { error: updateError } = await supabase
        .from('user_roles')
        .update({ role: 'admin' })
        .eq('user_id', user.id)
      
      if (updateError) {
        throw updateError
      }
      
      console.log('✅ Rol actualizado a administrador')
    } else {
      // Crear nuevo rol de administrador
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: 'admin'
        })
      
      if (insertError) {
        throw insertError
      }
      
      console.log('✅ Rol de administrador creado')
    }
    
    console.log(`🎉 El usuario ${email} ahora es administrador`)
    
  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

// Ejecutar el script
const email = 'nicolas.ossandon7@gmail.com'
makeUserAdmin(email) 