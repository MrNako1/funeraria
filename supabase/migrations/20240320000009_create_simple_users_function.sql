-- Crear una función simple que devuelve usuarios basada solo en user_roles
create or replace function public.get_users_simple()
returns table (
  id uuid,
  email text,
  created_at timestamptz,
  role text
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
  
  -- Verificar si el usuario está autenticado
  if current_user_id is null then
    raise exception 'Usuario no autenticado';
  end if;

  -- Verificar si el usuario es admin
  select exists (
    select 1 
    from public.user_roles ur
    where ur.user_id = current_user_id 
    and ur.role = 'admin'
  ) into is_admin;

  -- Si no es admin, lanzar excepción
  if not is_admin then
    raise exception 'No tienes permisos de administrador';
  end if;

  -- Si es admin, devolver los usuarios de user_roles
  return query
  select 
    ur.user_id as id,
    'Usuario ' || substring(ur.user_id::text, 1, 8) || '...' as email,
    ur.created_at,
    ur.role
  from public.user_roles ur
  order by ur.created_at desc;
  
  -- Si no hay usuarios en user_roles, devolver al menos el admin actual
  if not found then
    return query
    select 
      current_user_id as id,
      'Admin actual' as email,
      now() as created_at,
      'admin' as role;
  end if;
end;
$$;

-- Otorgar permisos de ejecución
grant execute on function public.get_users_simple() to authenticated; 