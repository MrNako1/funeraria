// Configuración de autenticación
export const authConfig = {
  // Habilitar login automático
  disableAutoLogin: false,
  
  // Tiempo de expiración de sesión (en segundos)
  sessionExpiry: 24 * 60 * 60, // 24 horas
  
  // Configuración de persistencia
  persistSession: true,
  
  // Configuración de cookies
  cookieOptions: {
    name: 'sb-auth-token',
    lifetime: 24 * 60 * 60, // 24 horas
    domain: process.env.NODE_ENV === 'production' ? '.tu-dominio.com' : 'localhost',
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true
  }
}

// Función para limpiar solo cookies de autenticación
export const clearAuthCookies = () => {
  try {
    // Lista de cookies específicas de autenticación
    const authCookieNames = [
      'sb-auth-token',
      'supabase.auth.token',
      'sb-access-token',
      'sb-refresh-token',
      'supabase-auth-token'
    ]
    
    // Limpiar cookies específicas de autenticación
    authCookieNames.forEach(cookieName => {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname}`
    })
    
    // Limpiar localStorage y sessionStorage
    localStorage.removeItem('supabase.auth.token')
    sessionStorage.removeItem('supabase.auth.token')
    
    console.log('✅ Cookies de autenticación limpiadas')
  } catch (error) {
    console.error('❌ Error limpiando cookies de autenticación:', error)
  }
}

// Función para limpiar datos de sesión del navegador
export const clearBrowserSession = () => {
  try {
    // Limpiar localStorage
    localStorage.clear()
    
    // Limpiar sessionStorage
    sessionStorage.clear()
    
    // Limpiar cookies específicas de Supabase
    const cookies = document.cookie.split(';')
    cookies.forEach(cookie => {
      const eqPos = cookie.indexOf('=')
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
      
      // Eliminar cookies relacionadas con autenticación
      if (name.includes('supabase') || name.includes('auth') || name.includes('session')) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
      }
    })
    
    console.log('✅ Datos de sesión del navegador limpiados')
  } catch (error) {
    console.error('❌ Error limpiando datos del navegador:', error)
  }
}

// Función para verificar si hay una sesión persistente
export const checkPersistentSession = () => {
  try {
    const hasLocalStorage = localStorage.getItem('supabase.auth.token') !== null
    const hasSessionStorage = sessionStorage.getItem('supabase.auth.token') !== null
    const hasCookies = document.cookie.includes('supabase')
    
    return {
      hasLocalStorage,
      hasSessionStorage,
      hasCookies,
      hasAnySession: hasLocalStorage || hasSessionStorage || hasCookies
    }
  } catch (error) {
    console.error('Error verificando sesión persistente:', error)
    return {
      hasLocalStorage: false,
      hasSessionStorage: false,
      hasCookies: false,
      hasAnySession: false
    }
  }
} 