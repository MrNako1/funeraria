-- Permitir que los administradores gestionen los roles de otros usuarios
-- Esta migración corrige las políticas para permitir gestión de roles por admins

-- Eliminar políticas existentes que puedan causar conflictos
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can update own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can delete own role" ON public.user_roles;

-- Política para que los usuarios vean su propio rol
CREATE POLICY "Users can view own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Política para que los usuarios puedan insertar su propio rol
CREATE POLICY "Users can insert own role" ON public.user_roles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para que los usuarios puedan actualizar su propio rol
CREATE POLICY "Users can update own role" ON public.user_roles
  FOR UPDATE USING (auth.uid() = user_id);

-- Política para que los usuarios puedan eliminar su propio rol
CREATE POLICY "Users can delete own role" ON public.user_roles
  FOR DELETE USING (auth.uid() = user_id);

-- Política para que los administradores puedan ver todos los roles
CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'admin'
    )
  );

-- Política para que los administradores puedan insertar roles para cualquier usuario
CREATE POLICY "Admins can insert any role" ON public.user_roles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'admin'
    )
  );

-- Política para que los administradores puedan actualizar roles de cualquier usuario
CREATE POLICY "Admins can update any role" ON public.user_roles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'admin'
    )
  );

-- Política para que los administradores puedan eliminar roles de cualquier usuario
CREATE POLICY "Admins can delete any role" ON public.user_roles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'admin'
    )
  );

-- Crear una función helper para verificar si el usuario actual es admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin'
  );
END;
$$; 