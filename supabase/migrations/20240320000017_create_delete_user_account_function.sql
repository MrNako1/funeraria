-- Crear función para eliminar cuentas de usuario de forma segura
-- Esta función permite a los administradores eliminar usuarios y todos sus datos asociados

CREATE OR REPLACE FUNCTION public.delete_user_account(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id uuid;
  is_admin boolean;
  user_exists boolean;
BEGIN
  -- Obtener el ID del usuario actual
  current_user_id := auth.uid();
  
  -- Verificar si el usuario está autenticado
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;

  -- Verificar si el usuario es admin
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = current_user_id 
    AND ur.role = 'admin'
  ) INTO is_admin;

  -- Si no es admin, lanzar excepción
  IF NOT is_admin THEN
    RAISE EXCEPTION 'No tienes permisos de administrador';
  END IF;

  -- Verificar que el usuario objetivo existe
  SELECT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = target_user_id
  ) INTO user_exists;

  IF NOT user_exists THEN
    RAISE EXCEPTION 'El usuario especificado no existe';
  END IF;

  -- Prevenir que un admin se elimine a sí mismo
  IF current_user_id = target_user_id THEN
    RAISE EXCEPTION 'No puedes eliminar tu propia cuenta';
  END IF;

  -- Eliminar datos asociados del usuario (en orden para evitar problemas de referencias)
  
  -- 1. Eliminar favoritos del usuario
  DELETE FROM public.memorial_favorites 
  WHERE user_id = target_user_id;
  
  -- 2. Eliminar rol del usuario
  DELETE FROM public.user_roles 
  WHERE user_id = target_user_id;
  
  -- 3. Eliminar el usuario de auth.users (esto se hace desde el cliente con service role)
  -- La eliminación de auth.users debe hacerse desde el cliente con permisos de service role
  
  RAISE NOTICE 'Datos asociados eliminados para el usuario %', target_user_id;
  
  RETURN TRUE;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error eliminando usuario: %', SQLERRM;
    RETURN FALSE;
END;
$$;

-- Otorgar permisos de ejecución
GRANT EXECUTE ON FUNCTION public.delete_user_account(uuid) TO authenticated;

-- Verificar que la función se creó correctamente
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'delete_user_account' 
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) THEN
    RAISE NOTICE '✅ Función delete_user_account creada exitosamente';
  ELSE
    RAISE NOTICE '❌ Error: La función no se pudo crear';
  END IF;
END $$; 