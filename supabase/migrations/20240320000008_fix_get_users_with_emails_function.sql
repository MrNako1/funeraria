-- Eliminar la función anterior si existe
drop function if exists public.get_users_with_emails();

-- Crear una función simplificada que devuelve los usuarios con sus emails
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
    raise exception 'Usuario no autenticado';
  end if;

  -- Verificar si el usuario es admin usando la función is_admin
  select public.is_admin(current_user_id) into is_admin;

  -- Si no es admin, lanzar excepción
  if not is_admin then
    raise exception 'No tienes permisos de administrador';
  end if;

  -- Si es admin, devolver los usuarios con sus emails reales
  -- Usar una consulta más simple y directa
  return query
  select 
    au.id,
    au.email,
    au.created_at,
    COALESCE(ur.role, 'user') as role
  from auth.users au
  left join public.user_roles ur on au.id = ur.user_id
  where au.email is not null
  order by au.created_at desc;
  
  -- Si no hay resultados, devolver al menos el usuario admin actual
  if not found then
    return query
    select 
      current_user_id as id,
      (select email from auth.users where id = current_user_id) as email,
      (select created_at from auth.users where id = current_user_id) as created_at,
      'admin' as role;
  end if;
end;
$$;

-- Otorgar permisos de ejecución
grant execute on function public.get_users_with_emails() to authenticated; 