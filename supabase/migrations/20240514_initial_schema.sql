-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create storage schema if not exists
CREATE SCHEMA IF NOT EXISTS storage;

-- Create plantillas table
CREATE TABLE public.plantillas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fecha_nacimiento DATE NOT NULL,
    fecha_fallecimiento DATE NOT NULL,
    biografia TEXT NOT NULL,
    logros TEXT,
    comentarios TEXT,
    foto VARCHAR(255),
    videos JSONB DEFAULT '[]'::jsonb,
    primer_nombre VARCHAR(255) NOT NULL,
    segundo_nombre VARCHAR(255),
    apellido_paterno VARCHAR(255) NOT NULL,
    apellido_materno VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id UUID REFERENCES auth.users(id)
);

-- Create storage bucket for photos
INSERT INTO storage.buckets (id, name, public) VALUES
    ('fotos', 'fotos', true);

-- Create storage policies
CREATE POLICY "Fotos públicas" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'fotos');

CREATE POLICY "Solo usuarios autenticados pueden subir fotos" ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'fotos' AND
        auth.role() = 'authenticated'
    );

-- Create indexes
CREATE INDEX idx_plantillas_fechas ON public.plantillas(fecha_nacimiento, fecha_fallecimiento);
CREATE INDEX idx_plantillas_user_id ON public.plantillas(user_id);

-- Enable Row Level Security
ALTER TABLE public.plantillas ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Usuarios pueden ver todas las plantillas" ON public.plantillas
    FOR SELECT
    USING (true);

CREATE POLICY "Usuarios pueden crear sus propias plantillas" ON public.plantillas
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden actualizar sus propias plantillas" ON public.plantillas
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden eliminar sus propias plantillas" ON public.plantillas
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create function for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER handle_plantillas_updated_at
    BEFORE UPDATE ON public.plantillas
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at(); 