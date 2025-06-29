# 🧹 Manejo de Sesiones - Funeraria

## Problema del Login Automático

Si te encuentras con que la aplicación te loguea automáticamente sin que lo desees, aquí tienes varias soluciones:

## 🔧 Soluciones Implementadas

### 1. Botón de Limpieza en la Página Principal
- En la página principal (`/`) hay un botón rojo "🧹 Limpiar Sesión" en la esquina superior derecha
- Este botón limpia completamente la sesión y recarga la página

### 2. Página de Autenticación Mejorada
- Ve a `/auth` para acceder a la página de login mejorada
- Incluye botones para:
  - 🔍 Verificar Estado de Sesión
  - 🧹 Limpiar Sesión Completamente

### 3. Scripts de Limpieza

#### Script Batch (Windows)
```bash
# Ejecuta el archivo batch
clear-session.bat
```

#### Script Node.js
```bash
# Limpiar todas las sesiones
node scripts/clear-all-sessions.js

# Limpiar solo sesiones activas
node scripts/clear-all-sessions.js active
```

## 🛠️ Limpieza Manual del Navegador

### Chrome/Edge
1. Abre las herramientas de desarrollador (F12)
2. Ve a la pestaña **Application** (o **Storage**)
3. En el panel izquierdo, expande **Storage**
4. Haz clic derecho en **Local Storage** y selecciona **Clear**
5. Haz clic derecho en **Session Storage** y selecciona **Clear**
6. Ve a **Cookies** y elimina todas las cookies del dominio

### Firefox
1. Abre las herramientas de desarrollador (F12)
2. Ve a la pestaña **Storage**
3. Limpia **Local Storage** y **Session Storage**
4. Elimina las cookies

## 🔍 Verificar Estado de Sesión

### Desde la Consola del Navegador
```javascript
// Verificar localStorage
console.log('localStorage:', localStorage.getItem('supabase.auth.token'))

// Verificar sessionStorage
console.log('sessionStorage:', sessionStorage.getItem('supabase.auth.token'))

// Verificar cookies
console.log('cookies:', document.cookie)

// Limpiar todo manualmente
localStorage.clear()
sessionStorage.clear()
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
})
```

## ⚙️ Configuración de Autenticación

### Archivo: `src/lib/auth-config.ts`
```typescript
export const authConfig = {
  // Deshabilitar login automático
  disableAutoLogin: true,
  
  // Deshabilitar persistencia de sesión
  persistSession: false,
  
  // Configuración de cookies
  cookieOptions: {
    name: 'sb-auth-token',
    lifetime: 24 * 60 * 60, // 24 horas
    domain: '',
    path: '/',
    sameSite: 'lax'
  }
}
```

## 🚀 Cómo Usar

### Para Limpiar Sesión Rápidamente:
1. Ve a la página principal (`/`)
2. Haz clic en el botón rojo "🧹 Limpiar Sesión"
3. Recarga la página

### Para Login Manual:
1. Ve a `/auth`
2. Usa los botones de control para verificar y limpiar sesión
3. Luego inicia sesión manualmente con tus credenciales

### Para Desarrollo:
1. Ejecuta `clear-session.bat` para limpiar sesiones del servidor
2. Limpia manualmente el navegador
3. Reinicia el servidor de desarrollo

## 🔒 Seguridad

- Las sesiones se configuran para no persistir automáticamente
- Se requiere login manual cada vez que se necesite autenticación
- Los tokens se limpian completamente al cerrar sesión

## 🐛 Troubleshooting

### Si el login automático persiste:
1. Ejecuta `clear-session.bat`
2. Limpia manualmente el navegador
3. Reinicia el servidor de desarrollo (`npm run dev`)
4. Abre una ventana de incógnito para probar

### Si hay errores de autenticación:
1. Verifica las variables de entorno en `.env.local`
2. Asegúrate de que Supabase esté funcionando
3. Revisa la consola del navegador para errores

## 📝 Notas Importantes

- El login automático está **deshabilitado por defecto**
- Las sesiones no persisten entre reinicios del navegador
- Se requiere autenticación manual para acceder a áreas protegidas
- Los administradores pueden acceder al panel sin login adicional si ya están autenticados 