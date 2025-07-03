const { createClient } = require('@supabase/supabase-js')

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno de Supabase no encontradas')
  console.log('Asegúrate de tener configurado el archivo .env.local con:')
  console.log('- NEXT_PUBLIC_SUPABASE_URL')
  console.log('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const testMemorials = [
  {
    primer_nombre: 'María',
    segundo_nombre: 'Isabel',
    apellido_paterno: 'González',
    apellido_materno: 'López',
    fecha_nacimiento: '1950-03-15',
    fecha_fallecimiento: '2023-12-10',
    biografia: 'María Isabel fue una mujer extraordinaria que dedicó su vida a su familia y a ayudar a los demás. Siempre tenía una sonrisa en su rostro y un consejo sabio para quien lo necesitara.',
    comentarios: 'Te extrañamos cada día, mamá. Tu amor y sabiduría siguen guiándonos.',
    logros: 'Fundadora de la Asociación de Mujeres Emprendedoras, Premio al Mérito Comunitario 2018',
    foto: null
  },
  {
    primer_nombre: 'Carlos',
    segundo_nombre: 'Alberto',
    apellido_paterno: 'Rodríguez',
    apellido_materno: 'Martínez',
    fecha_nacimiento: '1945-07-22',
    fecha_fallecimiento: '2023-08-05',
    biografia: 'Carlos Alberto fue un hombre trabajador y dedicado que construyó un legado de honestidad y esfuerzo. Su pasión por la música y la literatura inspiró a muchas generaciones.',
    comentarios: 'Papá, tu ejemplo de vida nos sigue inspirando cada día.',
    logros: 'Ingeniero Civil con más de 30 años de experiencia, Músico aficionado, Premio al Mejor Padre 2020',
    foto: null
  },
  {
    primer_nombre: 'Ana',
    segundo_nombre: 'Sofía',
    apellido_paterno: 'Hernández',
    apellido_materno: 'García',
    fecha_nacimiento: '1980-11-08',
    fecha_fallecimiento: '2023-05-20',
    biografia: 'Ana Sofía fue una joven brillante que dedicó su vida a la medicina y al cuidado de los demás. Su sonrisa iluminaba cualquier habitación y su compasión no conocía límites.',
    comentarios: 'Hermana querida, tu luz sigue brillando en nuestros corazones.',
    logros: 'Médica especialista en pediatría, Voluntaria en organizaciones benéficas, Premio al Mérito Médico 2022',
    foto: null
  }
]

async function createTestMemorials() {
  console.log('🔄 Creando memoriales de prueba...')
  console.log('=====================================')
  
  try {
    // Verificar conexión
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

    // Verificar tabla plantillas
    console.log('\n2️⃣ Verificando tabla plantillas...')
    const { data: tableData, error: tableError } = await supabase
      .from('plantillas')
      .select('id')
      .limit(1)
    
    if (tableError) {
      console.error('❌ Error con tabla plantillas:', tableError)
      console.log('🔧 Verifica que la tabla plantillas existe en tu base de datos')
      return
    }
    console.log('✅ Tabla plantillas existe y es accesible')

    // Insertar memoriales de prueba
    console.log('\n3️⃣ Insertando memoriales de prueba...')
    
    for (let i = 0; i < testMemorials.length; i++) {
      const memorial = testMemorials[i]
      console.log(`   Insertando memorial ${i + 1}/${testMemorials.length}: ${memorial.primer_nombre} ${memorial.apellido_paterno}`)
      
      const { data, error } = await supabase
        .from('plantillas')
        .insert(memorial)
        .select()
        .single()
      
      if (error) {
        console.error(`   ❌ Error insertando memorial ${i + 1}:`, error)
      } else {
        console.log(`   ✅ Memorial ${i + 1} creado exitosamente (ID: ${data.id})`)
      }
    }

    // Verificar memoriales creados
    console.log('\n4️⃣ Verificando memoriales creados...')
    const { data: allMemorials, error: verifyError } = await supabase
      .from('plantillas')
      .select('id, primer_nombre, apellido_paterno')
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (verifyError) {
      console.error('❌ Error verificando memoriales:', verifyError)
    } else {
      console.log(`✅ Total de memoriales en la base de datos: ${allMemorials.length}`)
      console.log('📋 Memoriales disponibles:')
      allMemorials.forEach((memorial, index) => {
        console.log(`   ${index + 1}. ${memorial.primer_nombre} ${memorial.apellido_paterno} (ID: ${memorial.id})`)
      })
    }

    console.log('\n🎯 Resumen:')
    console.log('✅ Memoriales de prueba creados')
    console.log('💡 Ahora puedes:')
    console.log('   1. Ir a la página /buscar')
    console.log('   2. Buscar por nombre (ej: "María", "Carlos", "Ana")')
    console.log('   3. Ver los memoriales en la aplicación web')

  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

createTestMemorials() 