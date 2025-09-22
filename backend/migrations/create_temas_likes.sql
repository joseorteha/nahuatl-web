-- Crear tabla para likes de temas
CREATE TABLE IF NOT EXISTS public.temas_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tema_id uuid NOT NULL,
  usuario_id uuid NOT NULL,
  fecha_creacion timestamp with time zone DEFAULT now(),
  CONSTRAINT temas_likes_pkey PRIMARY KEY (id),
  CONSTRAINT temas_likes_tema_id_fkey FOREIGN KEY (tema_id) REFERENCES public.temas_conversacion(id) ON DELETE CASCADE,
  CONSTRAINT temas_likes_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.perfiles(id) ON DELETE CASCADE,
  CONSTRAINT temas_likes_unique UNIQUE (tema_id, usuario_id)
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_temas_likes_tema_id ON public.temas_likes(tema_id);
CREATE INDEX IF NOT EXISTS idx_temas_likes_usuario_id ON public.temas_likes(usuario_id);
