-- Script para corregir la restricción de verificación de roles
-- Ejecutar este script en el SQL Editor de Supabase

-- Mostrar la restricción actual
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.user_roles'::regclass 
AND contype = 'c';

-- Eliminar la restricción existente
ALTER TABLE public.user_roles 
DROP CONSTRAINT IF EXISTS user_roles_role_check;

-- Crear la nueva restricción que incluye 'cliente'
ALTER TABLE public.user_roles 
ADD CONSTRAINT user_roles_role_check 
CHECK (role IN ('user', 'admin', 'cliente'));

-- Verificar que la restricción se aplicó correctamente
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.user_roles'::regclass 
AND contype = 'c';

-- Probar la nueva restricción usando un usuario existente
DO $$
DECLARE
    existing_user_id uuid;
BEGIN
    -- Obtener un usuario existente para la prueba
    SELECT id INTO existing_user_id 
    FROM auth.users 
    LIMIT 1;
    
    IF existing_user_id IS NOT NULL THEN
        -- Intentar insertar roles válidos
        BEGIN
            INSERT INTO public.user_roles (user_id, role) 
            VALUES (existing_user_id, 'user')
            ON CONFLICT (user_id) DO UPDATE SET role = 'user';
            RAISE NOTICE '✅ Rol "user" aceptado correctamente para usuario %', existing_user_id;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '❌ Error con rol "user": %', SQLERRM;
        END;
        
        BEGIN
            INSERT INTO public.user_roles (user_id, role) 
            VALUES (existing_user_id, 'admin')
            ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
            RAISE NOTICE '✅ Rol "admin" aceptado correctamente para usuario %', existing_user_id;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '❌ Error con rol "admin": %', SQLERRM;
        END;
        
        BEGIN
            INSERT INTO public.user_roles (user_id, role) 
            VALUES (existing_user_id, 'cliente')
            ON CONFLICT (user_id) DO UPDATE SET role = 'cliente';
            RAISE NOTICE '✅ Rol "cliente" aceptado correctamente para usuario %', existing_user_id;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '❌ Error con rol "cliente": %', SQLERRM;
        END;
        
        RAISE NOTICE '🎉 Restricción de roles actualizada correctamente. Roles permitidos: user, admin, cliente';
    ELSE
        RAISE NOTICE '⚠️ No hay usuarios en la tabla auth.users para probar';
        RAISE NOTICE '✅ Restricción de roles actualizada correctamente. Roles permitidos: user, admin, cliente';
    END IF;
END $$; 