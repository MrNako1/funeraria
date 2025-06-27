-- Corregir las políticas RLS de user_roles para evitar referencias circulares
-- Primero eliminamos las políticas existentes
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- Política simple para que los usuarios vean solo su propio rol
CREATE POLICY "Users can view own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Política para que los usuarios puedan insertar su propio rol (para el registro automático)
CREATE POLICY "Users can insert own role" ON public.user_roles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para que los usuarios puedan actualizar su propio rol
CREATE POLICY "Users can update own role" ON public.user_roles
  FOR UPDATE USING (auth.uid() = user_id);

-- Política para que los usuarios puedan eliminar su propio rol
CREATE POLICY "Users can delete own role" ON public.user_roles
  FOR DELETE USING (auth.uid() = user_id);

-- Política para que los admins puedan ver todos los roles (sin referencia circular)
-- Esta política se aplicará manualmente en el código cuando sea necesario
-- Por ahora, los admins tendrán que usar el panel de administración de Supabase 