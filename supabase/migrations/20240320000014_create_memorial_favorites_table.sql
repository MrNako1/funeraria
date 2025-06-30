-- Crear tabla memorial_favorites
CREATE TABLE IF NOT EXISTS public.memorial_favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    memorial_id UUID NOT NULL REFERENCES public.plantillas(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, memorial_id)
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_memorial_favorites_user_id ON public.memorial_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_memorial_favorites_memorial_id ON public.memorial_favorites(memorial_id);
CREATE INDEX IF NOT EXISTS idx_memorial_favorites_created_at ON public.memorial_favorites(created_at);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.memorial_favorites ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para memorial_favorites
-- Los usuarios pueden ver solo sus propios favoritos
CREATE POLICY "Users can view their own favorites" ON public.memorial_favorites
    FOR SELECT USING (auth.uid() = user_id);

-- Los usuarios pueden insertar sus propios favoritos
CREATE POLICY "Users can insert their own favorites" ON public.memorial_favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden eliminar sus propios favoritos
CREATE POLICY "Users can delete their own favorites" ON public.memorial_favorites
    FOR DELETE USING (auth.uid() = user_id);

-- Los administradores pueden ver todos los favoritos
CREATE POLICY "Admins can view all favorites" ON public.memorial_favorites
    FOR SELECT USING (
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