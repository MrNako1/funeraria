import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { authConfig } from './auth-config'

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
    
    // Flow de autenticación
    flowType: 'pkce',
    
    // Configuración de almacenamiento
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    
    // Configuración de cookies
    storageKey: 'supabase.auth.token'
  }
}) 