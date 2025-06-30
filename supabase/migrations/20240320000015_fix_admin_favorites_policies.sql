-- Corregir políticas RLS para administradores en memorial_favorites
-- Agregar permisos de INSERT para administradores

-- Eliminar políticas existentes de admin si existen
DROP POLICY IF EXISTS "Admins can view all favorites" ON public.memorial_favorites;
DROP POLICY IF EXISTS "Admins can delete any favorites" ON public.memorial_favorites;

-- Crear políticas corregidas para administradores
-- Los administradores pueden ver todos los favoritos
CREATE POLICY "Admins can view all favorites" ON public.memorial_favorites
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Los administradores pueden insertar cualquier favorito
CREATE POLICY "Admins can insert any favorites" ON public.memorial_favorites
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Los administradores pueden eliminar cualquier favorito
CREATE POLICY "Admins can delete any favorites" ON public.memorial_favorites
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Verificar que las políticas estén correctamente aplicadas
-- Esta consulta debería devolver todas las políticas de la tabla
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
WHERE tablename = 'memorial_favorites'
ORDER BY policyname; 