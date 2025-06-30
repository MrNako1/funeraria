# 🖤 Funcionalidad de Favoritos

## 📋 Descripción

La funcionalidad de favoritos permite a los usuarios guardar memoriales que les gusten para acceder a ellos fácilmente desde la página de favoritos.

## 🗄️ Estructura de la Base de Datos

### Tabla: `memorial_favorites`

```sql
CREATE TABLE public.memorial_favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    memorial_id UUID NOT NULL REFERENCES public.plantillas(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, memorial_id)
);
```

### Políticas RLS (Row Level Security)

- **Usuarios**: Pueden ver, agregar y eliminar solo sus propios favoritos
- **Administradores**: Pueden ver y eliminar cualquier favorito

## 🧩 Componentes

### MemorialFavoriteButton

**Ubicación**: `src/components/memorial/MemorialFavoriteButton.tsx`

**Funcionalidad**:
- Muestra el estado actual del memorial (favorito o no)
- Permite agregar/quitar de favoritos
- Maneja estados de carga y errores
- Muestra mensaje si el usuario no está autenticado

**Props**:
- `memorialId`: ID del memorial

**Estados**:
- `isFavorite`: Boolean que indica si está en favoritos
- `loading`: Boolean que indica si está procesando

### Página de Favoritos

**Ubicación**: `src/app/favoritos/page.tsx`

**Funcionalidad**:
- Lista todos los memoriales favoritos del usuario
- Muestra información básica de cada memorial
- Enlaces directos a los memoriales
- Manejo de estados vacíos y errores

## 🔧 Configuración

### 1. Aplicar Migración

```bash
# Ejecutar el script de migración
./apply-memorial-favorites.bat

# O manualmente
npx supabase db push
```

### 2. Verificar Configuración

```bash
# Ejecutar script de prueba
node test-favorites.js
```

## 🚀 Uso

### Para Usuarios

1. **Agregar a Favoritos**:
   - Navega a cualquier memorial
   - Haz clic en el botón "Agregar a favoritos" (corazón vacío)
   - El corazón se llenará de rojo

2. **Ver Favoritos**:
   - Ve a la página `/favoritos`
   - Verás todos tus memoriales favoritos

3. **Quitar de Favoritos**:
   - En el memorial o en la página de favoritos
   - Haz clic en "Quitar de favoritos" (corazón lleno)
   - El corazón se vaciará

### Para Desarrolladores

```tsx
// Usar el componente en cualquier página
import MemorialFavoriteButton from '@/components/memorial/MemorialFavoriteButton'

<MemorialFavoriteButton memorialId="memorial-id-here" />
```

## 🐛 Solución de Problemas

### Error: "La tabla memorial_favorites no existe"

**Solución**:
1. Ejecuta la migración: `./apply-memorial-favorites.bat`
2. Verifica que Supabase esté ejecutándose: `npx supabase status`

### Error: "No tienes permisos"

**Solución**:
1. Verifica que el usuario esté autenticado
2. Revisa las políticas RLS en la base de datos
3. Asegúrate de que el usuario tenga un rol asignado

### El botón no responde

**Solución**:
1. Abre la consola del navegador (F12)
2. Verifica si hay errores de JavaScript
3. Comprueba que las variables de entorno de Supabase estén configuradas

### Los favoritos no se guardan

**Solución**:
1. Verifica la conexión a Supabase
2. Revisa los logs en la consola del navegador
3. Comprueba que el usuario esté autenticado correctamente

## 📊 Monitoreo

### Logs Importantes

- `Error al verificar estado de favorito`: Problema al cargar el estado
- `Error al agregar a favoritos`: Problema al guardar favorito
- `Error al eliminar de favoritos`: Problema al eliminar favorito
- `Usuario no autenticado`: Usuario no ha iniciado sesión

### Métricas a Seguir

- Número de favoritos por usuario
- Memoriales más favoritos
- Tasa de conversión (vistas vs favoritos)

## 🔒 Seguridad

- **Autenticación requerida**: Solo usuarios autenticados pueden usar favoritos
- **RLS activado**: Los usuarios solo ven sus propios favoritos
- **Validación de datos**: Se valida que el memorial existe antes de agregarlo
- **Prevención de duplicados**: Constraint UNIQUE en (user_id, memorial_id)

## 🎯 Próximas Mejoras

- [ ] Notificaciones cuando se agrega/quita de favoritos
- [ ] Sincronización en tiempo real entre dispositivos
- [ ] Categorización de favoritos
- [ ] Exportar lista de favoritos
- [ ] Compartir lista de favoritos 