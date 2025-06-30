// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno de Supabase no encontradas')
  console.log('Verifica tu archivo .env.local:')
  console.log('NEXT_PUBLIC_SUPABASE_URL=tu_url')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key')
  process.exit(1)
}

console.log('🔧 Configuración cargada:')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseKey.substring(0, 20) + '...')

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugFavorites() {
  console.log('🔍 Diagnóstico de Favoritos')
  console.log('============================')
  
  try {
    // 1. Verificar conexión a Supabase
    console.log('\n1️⃣ Verificando conexión a Supabase...')
    const { data: testData, error: testError } = await supabase
      .from('user_roles')
      .select('id')
      .limit(1)
    
    if (testError) {
      console.error('❌ Error de conexión:', testError)
      return
    }
    console.log('✅ Conexión a Supabase exitosa')

    // 2. Verificar si la tabla memorial_favorites existe
    console.log('\n2️⃣ Verificando tabla memorial_favorites...')
    const { data: tableData, error: tableError } = await supabase
      .from('memorial_favorites')
      .select('id')
      .limit(1)
    
    if (tableError) {
      console.error('❌ Error con tabla memorial_favorites:', tableError)
      console.log('\n🔧 Solución:')
      console.log('1. Ejecuta: ./apply-memorial-favorites.bat')
      console.log('2. O manualmente: npx supabase db push')
      return
    }
    console.log('✅ Tabla memorial_favorites existe y es accesible')

    // 3. Verificar memoriales disponibles
    console.log('\n3️⃣ Verificando memoriales disponibles...')
    const { data: memorials, error: memorialsError } = await supabase
      .from('plantillas')
      .select('id, primer_nombre, apellido_paterno')
      .limit(3)
    
    if (memorialsError) {
      console.error('❌ Error al obtener memoriales:', memorialsError)
      return
    }
    
    if (!memorials || memorials.length === 0) {
      console.log('⚠️ No hay memoriales disponibles')
      console.log('Crea algunos memoriales primero')
      return
    }
    
    console.log(`✅ Encontrados ${memorials.length} memoriales`)
    memorials.forEach((memorial, index) => {
      console.log(`   ${index + 1}. ${memorial.primer_nombre} ${memorial.apellido_paterno} (ID: ${memorial.id})`)
    })

    // 4. Verificar políticas RLS
    console.log('\n4️⃣ Verificando políticas RLS...')
    console.log('ℹ️ Las políticas RLS requieren autenticación')
    console.log('ℹ️ Esto se probará cuando inicies sesión')

    // 5. Probar inserción sin autenticación (debería fallar)
    console.log('\n5️⃣ Probando inserción sin autenticación...')
    const { error: insertError } = await supabase
      .from('memorial_favorites')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000',
        memorial_id: memorials[0].id
      })
    
    if (insertError) {
      console.log('✅ Políticas RLS funcionando (inserción bloqueada sin auth)')
      console.log('   Error esperado:', insertError.message)
    } else {
      console.log('⚠️ Políticas RLS no están funcionando correctamente')
    }

    // 6. Verificar estructura de la tabla
    console.log('\n6️⃣ Verificando estructura de la tabla...')
    const { data: structureData, error: structureError } = await supabase
      .rpc('get_table_structure', { table_name: 'memorial_favorites' })
      .catch(() => ({ data: null, error: { message: 'Función no disponible' } }))
    
    if (structureError) {
      console.log('ℹ️ No se pudo verificar estructura automáticamente')
      console.log('ℹ️ Verifica manualmente en Supabase Dashboard:')
      console.log('   - Tabla: memorial_favorites')
      console.log('   - Columnas: id, user_id, memorial_id, created_at')
      console.log('   - RLS: Habilitado')
      console.log('   - Políticas: Configuradas')
    } else {
      console.log('✅ Estructura de tabla verificada')
    }

    // 7. Instrucciones para probar
    console.log('\n📋 Instrucciones para probar el botón:')
    console.log('1. Inicia sesión en la aplicación')
    console.log('2. Abre la consola del navegador (F12)')
    console.log('3. Ve a un memorial: /memorial/[ID]')
    console.log('4. Busca el botón de favoritos (corazón)')
    console.log('5. Haz clic en el botón')
    console.log('6. Verifica los logs en la consola')
    console.log('7. Si hay errores, compártelos')

    // 8. Verificar variables de entorno
    console.log('\n🔧 Verificación de configuración:')
    console.log(`   Supabase URL: ${supabaseUrl ? '✅ Configurada' : '❌ Faltante'}`)
    console.log(`   Supabase Key: ${supabaseKey ? '✅ Configurada' : '❌ Faltante'}`)
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('\n❌ Problema: Variables de entorno faltantes')
      console.log('Crea un archivo .env.local con:')
      console.log('NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase')
      console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima')
    }

  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

// Ejecutar diagnóstico
debugFavorites() 