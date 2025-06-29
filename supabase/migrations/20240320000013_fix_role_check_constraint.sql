-- Corregir la restricción de verificación de roles para incluir 'cliente'
-- Esta migración actualiza la constraint para permitir el rol 'cliente'

-- Primero, eliminar la restricción existente
ALTER TABLE public.user_roles 
DROP CONSTRAINT IF EXISTS user_roles_role_check;

-- Crear la nueva restricción que incluye 'cliente'
ALTER TABLE public.user_roles 
ADD CONSTRAINT user_roles_role_check 
CHECK (role IN ('user', 'admin', 'cliente'));

-- Verificar que la restricción se aplicó correctamente
DO $$
BEGIN
    -- Intentar insertar un rol válido para verificar
    INSERT INTO public.user_roles (user_id, role) 
    VALUES ('00000000-0000-0000-0000-000000000000', 'cliente')
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Limpiar el registro de prueba
    DELETE FROM public.user_roles 
    WHERE user_id = '00000000-0000-0000-0000-000000000000';
    
    RAISE NOTICE 'Restricción de roles actualizada correctamente. Roles permitidos: user, admin, cliente';
END $$; 