-- Script para arreglar las políticas RLS de la tabla plantillas
-- Ejecuta este script en el SQL Editor de Supabase

-- 1. Habilitar RLS en la tabla plantillas (si no está habilitado)
ALTER TABLE public.plantillas ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas existentes (si las hay)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.plantillas;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.plantillas;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.plantillas;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.plantillas;
DROP POLICY IF EXISTS "Admins can do everything" ON public.plantillas;

-- 3. Crear políticas para permitir acceso público a los memoriales
-- Política para lectura: todos pueden ver los memoriales
CREATE POLICY "Enable read access for all users" ON public.plantillas
    FOR SELECT USING (true);

-- Política para inserción: usuarios autenticados pueden crear memoriales
CREATE POLICY "Enable insert for authenticated users only" ON public.plantillas
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para actualización: usuarios autenticados pueden actualizar memoriales
CREATE POLICY "Enable update for authenticated users only" ON public.plantillas
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para eliminación: usuarios autenticados pueden eliminar memoriales
CREATE POLICY "Enable delete for authenticated users only" ON public.plantillas
    FOR DELETE USING (auth.role() = 'authenticated');

-- 4. Políticas específicas para administradores (opcional)
-- Los administradores pueden hacer todo
CREATE POLICY "Admins can do everything" ON public.plantillas
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- 5. Verificar que las políticas se crearon correctamente
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'plantillas'; 