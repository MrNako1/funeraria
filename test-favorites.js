const { createClient } = require('@supabase/supabase-js')

// Configuración de Supabase (reemplaza con tus credenciales)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno de Supabase no encontradas')
  console.log('Asegúrate de tener configurado:')
  console.log('- NEXT_PUBLIC_SUPABASE_URL')
  console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testFavorites() {
  console.log('🧪 Iniciando pruebas de favoritos...')
  
  try {
    // 1. Verificar que la tabla existe
    console.log('\n1️⃣ Verificando tabla memorial_favorites...')
    const { data: tableExists, error: tableError } = await supabase
      .from('memorial_favorites')
      .select('id')
      .limit(1)
    
    if (tableError) {
      console.error('❌ Error: La tabla memorial_favorites no existe o no es accesible')
      console.error('Detalles:', tableError)
      return
    }
    
    console.log('✅ Tabla memorial_favorites existe y es accesible')
    
    // 2. Verificar que hay memoriales disponibles
    console.log('\n2️⃣ Verificando memoriales disponibles...')
    const { data: memorials, error: memorialsError } = await supabase
      .from('plantillas')
      .select('id, primer_nombre, apellido_paterno')
      .limit(5)
    
    if (memorialsError) {
      console.error('❌ Error al obtener memoriales:', memorialsError)
      return
    }
    
    if (!memorials || memorials.length === 0) {
      console.log('⚠️ No hay memoriales disponibles para probar')
      return
    }
    
    console.log(`✅ Encontrados ${memorials.length} memoriales`)
    console.log('Memoriales disponibles:')
    memorials.forEach((memorial, index) => {
      console.log(`   ${index + 1}. ${memorial.primer_nombre} ${memorial.apellido_paterno} (ID: ${memorial.id})`)
    })
    
    // 3. Verificar políticas RLS
    console.log('\n3️⃣ Verificando políticas RLS...')
    console.log('ℹ️ Las políticas RLS requieren autenticación para ser probadas')
    console.log('ℹ️ Ejecuta este script después de iniciar sesión en la aplicación')
    
    // 4. Mostrar instrucciones para probar manualmente
    console.log('\n📋 Instrucciones para probar manualmente:')
    console.log('1. Inicia sesión en la aplicación')
    console.log('2. Ve a un memorial específico')
    console.log('3. Haz clic en el botón "Agregar a favoritos"')
    console.log('4. Verifica que el corazón se llene (rojo)')
    console.log('5. Ve a la página de favoritos (/favoritos)')
    console.log('6. Verifica que el memorial aparezca en la lista')
    console.log('7. Haz clic en "Quitar de favoritos"')
    console.log('8. Verifica que el memorial desaparezca de favoritos')
    
  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

// Ejecutar pruebas
testFavorites() 