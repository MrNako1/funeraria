-- Crear una función que devuelve los usuarios con sus emails reales
create or replace function public.get_users_with_emails()
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
    select auth.uid() into current_user_id;
    if current_user_id is null then
      raise exception 'Usuario no autenticado';
    end if;
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

  -- Si es admin, devolver los usuarios con sus emails reales
  return query
  select 
    au.id,
    au.email,
    au.created_at,
    COALESCE(ur.role, 'user') as role
  from auth.users au
  left join public.user_roles ur on au.id = ur.user_id
  order by au.created_at desc;
end;
$$; 