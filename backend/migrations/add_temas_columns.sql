-- Agregar columnas faltantes a temas_conversacion
ALTER TABLE public.temas_conversacion 
ADD COLUMN IF NOT EXISTS contador_likes integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS compartido_contador integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS trending_score integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS es_tema_principal boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS tema_padre_id uuid,
ADD COLUMN IF NOT EXISTS orden_respuesta integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS es_respuesta boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS contenido text;

-- Agregar foreign key para tema_padre_id
ALTER TABLE public.temas_conversacion 
ADD CONSTRAINT temas_padre_fkey 
FOREIGN KEY (tema_padre_id) REFERENCES public.temas_conversacion(id);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_temas_es_tema_principal ON public.temas_conversacion(es_tema_principal);
CREATE INDEX IF NOT EXISTS idx_temas_tema_padre_id ON public.temas_conversacion(tema_padre_id);
CREATE INDEX IF NOT EXISTS idx_temas_es_respuesta ON public.temas_conversacion(es_respuesta);
CREATE INDEX IF NOT EXISTS idx_temas_contador_likes ON public.temas_conversacion(contador_likes);
CREATE INDEX IF NOT EXISTS idx_temas_trending_score ON public.temas_conversacion(trending_score);
