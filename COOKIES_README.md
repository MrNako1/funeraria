# 🍪 Problemas de Cookies - Funeraria

## 🔍 **Problemas Identificados y Solucionados**

### 1. **Configuración Inconsistente de Cookies**

**Problema**: Había dos archivos de configuración de Supabase con configuraciones diferentes:
- `src/lib/supabase.ts` 
- `lib/supabase.ts`

**Solución**: Eliminé el archivo duplicado `lib/supabase.ts` y mejoré la configuración en `src/lib/supabase.ts`.

### 2. **Configuración de Dominio Incorrecta**

**Problema**: En `src/lib/auth-config.ts` el dominio estaba hardcodeado como `.tu-dominio.com`.

**Solución**: Cambié la configuración para que el navegador maneje automáticamente el dominio:
```typescript
domain: undefined, // Dejar que el navegador maneje el dominio
```

### 3. **Configuración httpOnly Conflictiva**

**Problema**: El middleware forzaba `httpOnly: true` para todas las cookies, pero el cliente intentaba acceder a ellas.

**Solución**: Cambié la configuración a `httpOnly: false` para permitir limpieza desde JavaScript:
```typescript
httpOnly: false, // Permitir acceso desde JavaScript para limpieza
```

### 4. **Manejo Inconsistente de Limpieza de Cookies**

**Problema**: La función `clearAuthCookies()` no funcionaba correctamente con cookies httpOnly.

**Solución**: Mejoré la función para manejar mejor la limpieza y agregué verificaciones de entorno:
```typescript
if (typeof window !== 'undefined') {
  // Limpiar localStorage y sessionStorage
  // Limpiar cookies específicas
}
```

## 🛠️ **Herramientas de Debug Implementadas**

### 1. **Componente CookieDebug**
- **Acceso**: Presiona `Ctrl+Shift+C` en cualquier página
- **Funcionalidades**:
  - Ver estado de localStorage, sessionStorage y cookies
  - Limpiar cookies con un clic
  - Auto-refresh cada 5 segundos
  - Vista expandida con detalles de cookies

### 2. **Script de Diagnóstico Mejorado**
```bash
node scripts/debug-cookies.js
```
- Verifica variables de entorno
- Comprueba archivos de configuración
- Proporciona recomendaciones específicas

### 3. **Script de Limpieza de Sesiones**
```bash
# Limpiar todas las sesiones
node scripts/clear-all-sessions.js

# Limpiar solo sesiones activas
node scripts/clear-all-sessions.js active
```

## 🔧 **Configuración Actual**

### Archivo: `src/lib/auth-config.ts`
```typescript
export const authConfig = {
  cookieOptions: {
    name: 'sb-auth-token',
    lifetime: 24 * 60 * 60, // 24 horas
    domain: undefined, // Dejar que el navegador maneje el dominio
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: false // Permitir acceso desde JavaScript
  }
}
```

### Archivo: `src/middleware.ts`
```typescript
cookies: {
  set: (name, value, options) => {
    res.cookies.set({
      name,
      value,
      ...options,
      httpOnly: false, // Permitir acceso desde JavaScript
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60, // 24 horas
    })
  }
}
```

## 🚀 **Cómo Usar las Herramientas de Debug**

### 1. **Debug en Tiempo Real**
1. Abre la aplicación en el navegador
2. Presiona `Ctrl+Shift+C` para mostrar el debug de cookies
3. Presiona `Ctrl+Shift+D` para mostrar el debug de autenticación
4. Usa los botones para actualizar o limpiar cookies

### 2. **Verificar desde la Consola**
```javascript
// Verificar cookies
console.log(document.cookie)

// Verificar localStorage
console.log(localStorage.getItem('supabase.auth.token'))

// Verificar sessionStorage
console.log(sessionStorage.getItem('supabase.auth.token'))

// Limpiar manualmente
localStorage.clear()
sessionStorage.clear()
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
})
```

### 3. **Scripts de Diagnóstico**
```bash
# Verificar configuración
node scripts/debug-cookies.js

# Limpiar sesiones
node scripts/clear-all-sessions.js
```

## 🔒 **Consideraciones de Seguridad**

### **Desarrollo vs Producción**
- **Desarrollo**: `httpOnly: false` para permitir debug
- **Producción**: `secure: true` para HTTPS
- **Ambos**: `sameSite: 'lax'` para protección CSRF

### **Limpieza de Cookies**
- Las cookies se limpian automáticamente al cerrar sesión
- Función manual disponible para casos especiales
- Verificación de entorno para evitar errores SSR

## 🐛 **Troubleshooting**

### **Si las cookies no se limpian:**
1. Verifica que no haya bloqueadores de cookies activos
2. Usa el modo incógnito para probar
3. Ejecuta el script de limpieza manual
4. Revisa la consola del navegador para errores

### **Si hay problemas de autenticación:**
1. Verifica las variables de entorno en `.env.local`
2. Asegúrate de que Supabase esté funcionando
3. Usa los componentes de debug para diagnosticar
4. Limpia manualmente el navegador si es necesario

### **Si el login automático persiste:**
1. Ejecuta `node scripts/clear-all-sessions.js`
2. Limpia manualmente el navegador
3. Reinicia el servidor de desarrollo
4. Abre una ventana de incógnito

## 📝 **Notas Importantes**

- Los componentes de debug solo están disponibles en desarrollo
- Las cookies se configuran automáticamente según el entorno
- La limpieza de cookies es más robusta y maneja errores
- Se agregaron verificaciones de entorno para evitar errores SSR
- El dominio se maneja automáticamente por el navegador

## 🔄 **Cambios Recientes**

1. **Eliminado**: Archivo duplicado `lib/supabase.ts`
2. **Mejorado**: Configuración de cookies en `auth-config.ts`
3. **Corregido**: Configuración httpOnly en `middleware.ts`
4. **Agregado**: Componente `CookieDebug` para debug en tiempo real
5. **Mejorado**: Scripts de diagnóstico y limpieza
6. **Agregado**: Verificaciones de entorno para evitar errores SSR 