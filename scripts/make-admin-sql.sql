-- Script para hacer administrador al usuario nicolas.ossandon7@gmail.com
-- Ejecutar este script en la consola SQL de Supabase

-- Primero, buscar el ID del usuario por email
DO $$
DECLARE
    user_id uuid;
BEGIN
    -- Obtener el ID del usuario por email
    SELECT id INTO user_id 
    FROM auth.users 
    WHERE email = 'nicolas.ossandon7@gmail.com';
    
    -- Verificar si el usuario existe
    IF user_id IS NULL THEN
        RAISE EXCEPTION 'No se encontró un usuario con el email nicolas.ossandon7@gmail.com';
    END IF;
    
    -- Verificar si ya existe un rol para este usuario
    IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = user_id) THEN
        -- Actualizar el rol existente
        UPDATE public.user_roles 
        SET role = 'admin' 
        WHERE user_id = user_id;
        
        RAISE NOTICE 'Rol actualizado a administrador para el usuario %', user_id;
    ELSE
        -- Crear nuevo rol de administrador
        INSERT INTO public.user_roles (user_id, role) 
        VALUES (user_id, 'admin');
        
        RAISE NOTICE 'Rol de administrador creado para el usuario %', user_id;
    END IF;
    
    RAISE NOTICE 'El usuario nicolas.ossandon7@gmail.com ahora es administrador';
END $$; 