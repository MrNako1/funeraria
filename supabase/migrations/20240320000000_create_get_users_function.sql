-- Crear una función que devuelve los usuarios de auth.users
create or replace function public.get_users()
returns table (
  id uuid,
  email text,
  user_metadata jsonb,
  created_at timestamptz
) 
language plpgsql
security definer
as $$
declare
  current_user_id uuid;
  is_admin boolean;
begin
  -- Obtener el ID del usuario actual
  current_user_id := auth.uid();
  
  -- Debug: Imprimir el ID del usuario actual
  raise notice 'Current user ID: %', current_user_id;
  
  -- Verificar si el usuario está autenticado
  if current_user_id is null then
    -- Intentar obtener el ID de la sesión actual
    select auth.uid() into current_user_id;
    if current_user_id is null then
      raise exception 'Usuario no autenticado';
    end if;
  end if;

  -- Verificar si el usuario es admin
  select exists (
    select 1 
    from public.user_roles ur
    where ur.id = current_user_id 
    and ur.role = 'admin'
  ) into is_admin;

  -- Debug: Imprimir el resultado de la verificación de admin
  raise notice 'Is admin: %', is_admin;

  -- Si no es admin, lanzar excepción
  if not is_admin then
    raise exception 'No tienes permisos de administrador';
  end if;

  -- Si es admin, devolver los usuarios
  return query
  select 
    au.id,
    au.email,
    au.raw_user_meta_data as user_metadata,
    au.created_at
  from auth.users au;
end;
$$; 