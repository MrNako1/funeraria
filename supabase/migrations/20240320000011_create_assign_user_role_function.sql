-- Crear una función RPC para asignar roles de usuario
create or replace function public.assign_user_role(user_uuid uuid, user_role text)
returns void
language plpgsql
security definer
as $$
begin
  -- Insertar o actualizar el rol del usuario
  insert into public.user_roles (user_id, role)
  values (user_uuid, user_role)
  on conflict (user_id) 
  do update set role = user_role;
  
  raise notice 'Rol % asignado exitosamente al usuario %', user_role, user_uuid;
end;
$$;

-- Otorgar permisos de ejecución
grant execute on function public.assign_user_role(uuid, text) to authenticated; 