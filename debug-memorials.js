const { createClient } = require('@supabase/supabase-js')

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno de Supabase no encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugMemorials() {
  console.log('🔍 Diagnóstico de Memoriales')
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

    // 2. Verificar si la tabla plantillas existe y es accesible
    console.log('\n2️⃣ Verificando tabla plantillas...')
    const { data: tableData, error: tableError } = await supabase
      .from('plantillas')
      .select('id')
      .limit(1)
    
    if (tableError) {
      console.error('❌ Error con tabla plantillas:', tableError)
      console.log('\n🔧 Posibles soluciones:')
      console.log('1. Verifica que la tabla plantillas existe')
      console.log('2. Verifica las políticas RLS (Row Level Security)')
      console.log('3. Verifica que tienes permisos para acceder a la tabla')
      return
    }
    console.log('✅ Tabla plantillas existe y es accesible')

    // 3. Verificar memoriales disponibles
    console.log('\n3️⃣ Verificando memoriales disponibles...')
    const { data: memorials, error: memorialsError } = await supabase
      .from('plantillas')
      .select('id, primer_nombre, apellido_paterno')
      .limit(5)
    
    if (memorialsError) {
      console.error('❌ Error al obtener memoriales:', memorialsError)
      return
    }
    
    if (!memorials || memorials.length === 0) {
      console.log('⚠️ No hay memoriales disponibles')
      console.log('Crea algunos memoriales primero usando la página de administración')
      return
    }
    
    console.log(`✅ Encontrados ${memorials.length} memoriales`)
    console.log('Memoriales disponibles:')
    memorials.forEach((memorial, index) => {
      console.log(`   ${index + 1}. ${memorial.primer_nombre} ${memorial.apellido_paterno} (ID: ${memorial.id})`)
    })

    // 4. Verificar políticas RLS
    console.log('\n4️⃣ Verificando políticas RLS...')
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_policies_info')
      .catch(() => ({ data: null, error: 'Función no disponible' }))
    
    if (policiesError) {
      console.log('⚠️ No se pudo verificar políticas RLS automáticamente')
      console.log('Verifica manualmente las políticas en el dashboard de Supabase')
    } else {
      console.log('✅ Políticas RLS verificadas')
    }

    // 5. Probar búsqueda específica
    console.log('\n5️⃣ Probando búsqueda específica...')
    const testMemorial = memorials[0]
    const { data: searchResult, error: searchError } = await supabase
      .from('plantillas')
      .select('id, primer_nombre, apellido_paterno')
      .ilike('primer_nombre', `%${testMemorial.primer_nombre}%`)
      .limit(1)
    
    if (searchError) {
      console.error('❌ Error en búsqueda:', searchError)
    } else if (searchResult && searchResult.length > 0) {
      console.log('✅ Búsqueda funciona correctamente')
    } else {
      console.log('⚠️ Búsqueda no devuelve resultados esperados')
    }

    console.log('\n🎯 Resumen:')
    if (memorials && memorials.length > 0) {
      console.log('✅ Los memoriales existen y son accesibles')
      console.log('✅ La tabla plantillas está funcionando correctamente')
      console.log('💡 Si no ves memoriales en la aplicación web, verifica:')
      console.log('   1. Que estés en la página correcta (/buscar)')
      console.log('   2. Que hayas ingresado un término de búsqueda')
      console.log('   3. Que no haya errores en la consola del navegador')
    } else {
      console.log('❌ No hay memoriales en la base de datos')
      console.log('💡 Crea algunos memoriales usando la página de administración')
    }

  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

debugMemorials() 