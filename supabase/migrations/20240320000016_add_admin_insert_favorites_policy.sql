-- Agregar política RLS de INSERT para administradores en memorial_favorites
-- Esta política permite que los administradores agreguen cualquier memorial a favoritos

-- Crear política de INSERT para administradores
CREATE POLICY IF NOT EXISTS "Admins can insert any favorites" ON public.memorial_favorites
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- Verificar que la política se creó correctamente
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'memorial_favorites' 
        AND policyname = 'Admins can insert any favorites'
    ) THEN
        RAISE NOTICE '✅ Política "Admins can insert any favorites" creada exitosamente';
    ELSE
        RAISE NOTICE '❌ Error: La política no se pudo crear';
    END IF;
END $$; 