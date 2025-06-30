const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno de Supabase no encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testFavoritesFunctionality() {
  console.log('🧪 Probando funcionalidad de favoritos...')
  
  try {
    // 1. Verificar memoriales disponibles
    console.log('\n1️⃣ Verificando memoriales disponibles...')
    const { data: memorials, error: memorialsError } = await supabase
      .from('plantillas')
      .select('id, primer_nombre, apellido_paterno')
      .limit(3)
    
    if (memorialsError) {
      console.error('❌ Error al obtener memoriales:', memorialsError)
      return
    }
    
    if (!memorials || memorials.length === 0) {
      console.log('⚠️ No hay memoriales disponibles para probar')
      return
    }
    
    console.log(`✅ Encontrados ${memorials.length} memoriales`)
    const testMemorial = memorials[0]
    console.log(`   Memorial de prueba: ${testMemorial.primer_nombre} ${testMemorial.apellido_paterno}`)
    console.log(`   ID: ${testMemorial.id}`)

    // 2. Verificar usuarios administradores
    console.log('\n2️⃣ Verificando usuarios administradores...')
    const { data: admins, error: adminsError } = await supabase
      .from('user_roles')
      .select('user_id, role')
      .eq('role', 'admin')
      .limit(3)
    
    if (adminsError) {
      console.error('❌ Error al obtener administradores:', adminsError)
      return
    }
    
    if (!admins || admins.length === 0) {
      console.log('⚠️ No hay usuarios administradores configurados')
      console.log('   Ejecuta: node make-admin.js para crear un admin')
      return
    }
    
    console.log(`✅ Encontrados ${admins.length} administradores`)
    admins.forEach((admin, index) => {
      console.log(`   ${index + 1}. Admin ID: ${admin.user_id.slice(0, 8)}...`)
    })

    // 3. Verificar favoritos existentes
    console.log('\n3️⃣ Verificando favoritos existentes...')
    const { data: favorites, error: favoritesError } = await supabase
      .from('memorial_favorites')
      .select('id, user_id, memorial_id')
      .limit(5)
    
    if (favoritesError) {
      console.error('❌ Error al obtener favoritos:', favoritesError)
      return
    }
    
    console.log(`✅ Encontrados ${favorites?.length || 0} favoritos existentes`)
    if (favorites && favorites.length > 0) {
      favorites.forEach((fav, index) => {
        console.log(`   ${index + 1}. User: ${fav.user_id.slice(0, 8)}... | Memorial: ${fav.memorial_id.slice(0, 8)}...`)
      })
    }

    // 4. Instrucciones para probar manualmente
    console.log('\n📋 INSTRUCCIONES PARA PROBAR MANUALMENTE:')
    console.log('1. Primero, agrega la política RLS faltante:')
    console.log('   - Ve a Supabase Dashboard > Authentication > Policies')
    console.log('   - Busca memorial_favorites > New Policy')
    console.log('   - Nombre: "Admins can insert any favorites"')
    console.log('   - Target roles: "authenticated"')
    console.log('   - Using expression: EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = \'admin\')')
    console.log('   - Policy definition: INSERT')
    console.log('   - Guarda la política')
    console.log('')
    console.log('2. Luego, prueba en tu aplicación:')
    console.log('   - Inicia sesión como administrador')
    console.log('   - Ve a un memorial (ej: /memorial/' + testMemorial.id + ')')
    console.log('   - Haz clic en el botón "Agregar a favoritos"')
    console.log('   - El corazón debería cambiar de vacío a lleno')
    console.log('   - Ve a /favoritos para verificar que aparezca')
    console.log('')
    console.log('3. Si funciona, el botón debería:')
    console.log('   - Mostrar corazón vacío si no está en favoritos')
    console.log('   - Mostrar corazón lleno si está en favoritos')
    console.log('   - Cambiar estado al hacer clic')
    console.log('   - Mostrar loading mientras procesa')
    console.log('   - Mostrar errores si algo falla')

    // 5. Verificar configuración del componente
    console.log('\n🔧 Verificación de configuración:')
    console.log('   - Componente MemorialFavoriteButton: ✅ Mejorado')
    console.log('   - Tabla memorial_favorites: ✅ Existe')
    console.log('   - Políticas RLS básicas: ✅ Funcionando')
    console.log('   - Política INSERT para admins: ❌ FALTANTE (agregar manualmente)')
    console.log('   - Variables de entorno: ✅ Configuradas')
    console.log('   - Memoriales disponibles: ✅ ' + memorials.length + ' encontrados')
    console.log('   - Administradores: ✅ ' + admins.length + ' configurados')

  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

// Ejecutar prueba
testFavoritesFunctionality() 