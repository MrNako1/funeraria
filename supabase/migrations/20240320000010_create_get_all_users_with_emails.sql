-- Crear una función que obtenga todos los usuarios con emails reales
-- Esta función usa security definer para acceder a auth.users
create or replace function public.get_all_users_with_emails()
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

  -- Si es admin, devolver todos los usuarios con emails reales
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
end;
$$;

-- Otorgar permisos de ejecución
grant execute on function public.get_all_users_with_emails() to authenticated;

-- Crear también una función alternativa que use una vista materializada
create or replace function public.get_users_via_view()
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

  -- Si es admin, devolver usuarios usando una consulta directa
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
end;
$$;

-- Otorgar permisos de ejecución
grant execute on function public.get_users_via_view() to authenticated; 