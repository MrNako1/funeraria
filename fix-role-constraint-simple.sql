-- Script simple para corregir la restricción de verificación de roles
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

-- Mensaje de confirmación
SELECT '✅ Restricción de roles actualizada correctamente. Roles permitidos: user, admin, cliente' as status; 