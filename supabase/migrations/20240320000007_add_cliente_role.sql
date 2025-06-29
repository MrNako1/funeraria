-- Agregar el rol "cliente" al sistema
-- Esta migración actualiza las funciones para incluir el nuevo rol

-- Actualizar la función get_users_with_roles para incluir el rol cliente
create or replace function public.get_users_with_roles()
returns table (
  id uuid,
  email character varying(255),
  created_at timestamptz,
  role character varying(50)
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

  -- Si es admin, devolver los usuarios con sus roles (incluyendo cliente)
  return query
  select 
    au.id,
    au.email::character varying(255),
    au.created_at,
    COALESCE(ur.role, 'user')::character varying(50) as role
  from auth.users au
  left join public.user_roles ur on au.id = ur.user_id
  order by au.created_at desc;
end;
$$;

-- Actualizar la función get_users_with_emails para incluir el rol cliente
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

  -- Si es admin, devolver los usuarios con sus emails reales (incluyendo cliente)
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

-- Crear una función para asignar el rol cliente a un usuario
create or replace function public.assign_cliente_role(user_email text)
returns void
language plpgsql
security definer
as $$
declare
  target_user_id uuid;
begin
  -- Obtener el ID del usuario por email
  select id into target_user_id
  from auth.users
  where email = user_email;
  
  if target_user_id is null then
    raise exception 'Usuario no encontrado: %', user_email;
  end if;
  
  -- Insertar o actualizar el rol
  insert into public.user_roles (user_id, role)
  values (target_user_id, 'cliente')
  on conflict (user_id) 
  do update set role = 'cliente';
  
  raise notice 'Rol cliente asignado exitosamente a: %', user_email;
end;
$$; 