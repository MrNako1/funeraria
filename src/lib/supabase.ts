import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan las variables de entorno de Supabase')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Habilitar persistencia automática
    persistSession: true,
    
    // Auto refresh de tokens
    autoRefreshToken: true,
    
    // Detectar sesión en el navegador
    detectSessionInUrl: true,
    
    // Flow de autenticación más seguro
    flowType: 'pkce',
    
    // Configuración de almacenamiento mejorada
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    
    // Clave de almacenamiento específica
    storageKey: 'supabase.auth.token',
    
    // Configuración adicional para mejor persistencia
    debug: process.env.NODE_ENV === 'development'
  }
}) 