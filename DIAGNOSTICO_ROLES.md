# Diagnóstico y Solución del Problema de Cambio de Roles

## 🔍 Problema Identificado

El cambio de rol de usuario no está funcionando correctamente. Esto puede deberse a varios factores:

1. **Políticas de base de datos restrictivas**
2. **Función RPC no disponible o con errores**
3. **Problemas de permisos**
4. **Errores en la lógica de actualización**
5. **Restricción de verificación no permite el rol 'cliente'** ⚠️ **NUEVO**

## 🚨 Error Específico: Restricción de Verificación

Si ves este error en la consola:
```
❌ Error actualizando rol: 
Object
code: "23514"
message: "new row for relation \"user_roles\" violates check constraint \"user_roles_role_check\""
```

**Solución inmediata:**
1. Ve al panel de Supabase → **SQL Editor**
2. Copia y pega el contenido de `fix-role-constraint-simple.sql` ⚠️ **VERSIÓN SIMPLE**
3. Ejecuta el script
4. ¡Listo! El cambio de roles debería funcionar

## 🛠️ Soluciones Implementadas

### 1. Mejorado el Manejo de Errores
- Agregado logging detallado en `src/app/auth/page.tsx`
- La función ahora intenta tanto RPC como upsert directo
- Muestra información más específica de los errores

### 2. Página de Diagnóstico
- Nueva página en `/test-roles` para diagnosticar problemas
- Prueba automática de todas las funcionalidades
- Muestra resultados detallados de cada test

### 3. Scripts de Verificación
- `check-role-system.js` - Verifica el estado del sistema
- `test-role-update.js` - Prueba la actualización de roles
- `fix-admin-policies.sql` - Corrige las políticas de base de datos
- `fix-role-constraint-simple.sql` - Corrige la restricción de verificación (VERSIÓN SIMPLE) ⚠️ **RECOMENDADO**
- `fix-role-constraint.sql` - Corrige la restricción de verificación (con pruebas)

## 📋 Pasos para Diagnosticar

### Paso 1: Usar la Página de Diagnóstico
1. Ve a `http://localhost:3000/test-roles`
2. Inicia sesión como administrador
3. Haz clic en "Ejecutar Diagnóstico"
4. Revisa los resultados

### Paso 2: Aplicar las Políticas Corregidas
1. Ve al panel de Supabase
2. Navega a **SQL Editor**
3. Copia y pega el contenido de `fix-admin-policies.sql`
4. Ejecuta el script

### Paso 3: Corregir la Restricción de Roles ⚠️ **IMPORTANTE**
1. Ve al panel de Supabase
2. Navega a **SQL Editor**
3. Copia y pega el contenido de `fix-role-constraint-simple.sql` ⚠️ **VERSIÓN SIMPLE**
4. Ejecuta el script

### Paso 4: Verificar la Función RPC
1. En Supabase, ve a **Database** → **Functions**
2. Verifica que `assign_user_role` existe
3. Si no existe, ejecuta la migración correspondiente

## 🔧 Solución Manual

Si los pasos anteriores no funcionan, puedes aplicar la solución manual:

### 1. Verificar Variables de Entorno
Asegúrate de tener un archivo `.env.local` con:
```
NEXT_PUBLIC_SUPABASE_URL=tu-url-de-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima
```

### 2. Ejecutar Scripts de Verificación
```bash
# Verificar sistema
node check-role-system.js

# Probar actualización
node test-role-update.js
```

### 3. Aplicar Políticas Manualmente
Ejecuta este SQL en Supabase:
```sql
-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can update own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can delete own role" ON public.user_roles;

-- Crear políticas para usuarios
CREATE POLICY "Users can view own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own role" ON public.user_roles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own role" ON public.user_roles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own role" ON public.user_roles
  FOR DELETE USING (auth.uid() = user_id);

-- Crear políticas para administradores
CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert any role" ON public.user_roles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'admin'
    )
  );

CREATE POLICY "Admins can update any role" ON public.user_roles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete any role" ON public.user_roles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'admin'
    )
  );
```

### 4. Corregir Restricción de Roles ⚠️ **CRÍTICO**
```sql
-- Eliminar la restricción existente
ALTER TABLE public.user_roles 
DROP CONSTRAINT IF EXISTS user_roles_role_check;

-- Crear la nueva restricción que incluye 'cliente'
ALTER TABLE public.user_roles 
ADD CONSTRAINT user_roles_role_check 
CHECK (role IN ('user', 'admin', 'cliente'));
```

## 🧪 Pruebas de Verificación

### Test 1: Verificar Autenticación
- ✅ Usuario autenticado
- ✅ Rol detectado correctamente

### Test 2: Verificar Tabla
- ✅ Tabla `user_roles` accesible
- ✅ Permisos de lectura correctos

### Test 3: Verificar Función RPC
- ✅ Función `assign_user_role` disponible
- ✅ Parámetros correctos

### Test 4: Verificar Políticas
- ✅ Políticas permiten actualización
- ✅ Administradores pueden modificar roles

### Test 5: Verificar Restricción de Roles ⚠️ **NUEVO**
- ✅ Restricción permite rol 'cliente'
- ✅ No hay errores de constraint

### Test 6: Verificar Cambio Real
- ✅ Rol se actualiza en la base de datos
- ✅ Estado local se actualiza correctamente

## 🚨 Errores Comunes y Soluciones

### Error: "user_roles_role_check constraint"
**Solución**: Ejecutar `fix-role-constraint.sql` ⚠️ **MÁS COMÚN**

### Error: "Función no disponible"
**Solución**: Ejecutar la migración de la función RPC

### Error: "Políticas restrictivas"
**Solución**: Aplicar el script `fix-admin-policies.sql`

### Error: "Usuario no autenticado"
**Solución**: Verificar que el usuario esté logueado

### Error: "No tienes permisos"
**Solución**: Verificar que el usuario tenga rol de administrador

## 📞 Soporte

Si los problemas persisten:

1. Revisa la consola del navegador para errores específicos
2. Usa la página de diagnóstico en `/test-roles`
3. Verifica los logs del servidor de desarrollo
4. Revisa las políticas en el panel de Supabase
5. Ejecuta `fix-role-constraint.sql` si ves errores de constraint

## ✅ Verificación Final

Después de aplicar todas las soluciones:

1. ✅ El cambio de roles funciona desde la interfaz web
2. ✅ Los administradores pueden modificar roles de otros usuarios
3. ✅ Los usuarios normales solo pueden modificar su propio rol
4. ✅ La función de clientes funciona correctamente
5. ✅ No hay errores en la consola del navegador
6. ✅ La restricción de roles permite 'cliente' ⚠️ **NUEVO** 