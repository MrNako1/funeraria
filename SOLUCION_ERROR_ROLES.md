# Solución para Error "Error actualizando rol"

## Problema
El error "Error actualizando rol: Object" ocurre porque las políticas de la base de datos no permiten que los administradores modifiquen los roles de otros usuarios.

## Solución

### Paso 1: Aplicar las Políticas de Administrador

1. Ve al panel de administración de Supabase
2. Navega a **SQL Editor**
3. Copia y pega el contenido del archivo `fix-admin-policies.sql`
4. Ejecuta el script

### Paso 2: Verificar que Funciona

1. Inicia sesión como administrador
2. Ve a `/auth` para acceder al panel de administración
3. Intenta cambiar el rol de un usuario
4. El error debería desaparecer

## Cambios Realizados

### 1. Mejorado el Manejo de Errores
- El error ahora muestra información más detallada
- Se capturan diferentes tipos de errores de Supabase
- Se muestra el objeto completo del error para debugging

### 2. Cambiado el Método de Actualización
- Ahora usa la función RPC `assign_user_role` en lugar de upsert directo
- Esto evita problemas de políticas de seguridad

### 3. Nuevas Políticas de Base de Datos
- Los administradores pueden ver todos los roles
- Los administradores pueden insertar roles para cualquier usuario
- Los administradores pueden actualizar roles de cualquier usuario
- Los administradores pueden eliminar roles de cualquier usuario

## Archivos Modificados

- `src/app/auth/page.tsx` - Mejorado manejo de errores y cambio a función RPC
- `fix-admin-policies.sql` - Script SQL para aplicar políticas
- `supabase/migrations/20240320000012_fix_admin_role_management.sql` - Nueva migración

## Verificación

Después de aplicar los cambios:

1. ✅ El error "Error actualizando rol: Object" desaparece
2. ✅ Los administradores pueden cambiar roles de usuarios
3. ✅ Se muestran mensajes de error más informativos
4. ✅ La funcionalidad de clientes funciona correctamente

## Notas Importantes

- Las políticas solo afectan a usuarios autenticados
- Los usuarios normales solo pueden modificar su propio rol
- Los administradores pueden modificar cualquier rol
- La función RPC `assign_user_role` tiene permisos de seguridad definidos 