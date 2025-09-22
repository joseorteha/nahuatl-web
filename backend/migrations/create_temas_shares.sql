-- Crear tabla para shares de temas
CREATE TABLE IF NOT EXISTS public.temas_shares (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tema_id uuid NOT NULL,
  usuario_id uuid NOT NULL,
  plataforma text DEFAULT 'interno' CHECK (plataforma = ANY (ARRAY['interno'::text, 'facebook'::text, 'twitter'::text, 'whatsapp'::text, 'telegram'::text, 'otro'::text])),
  fecha_creacion timestamp with time zone DEFAULT now(),
  CONSTRAINT temas_shares_pkey PRIMARY KEY (id),
  CONSTRAINT temas_shares_tema_id_fkey FOREIGN KEY (tema_id) REFERENCES public.temas_conversacion(id) ON DELETE CASCADE,
  CONSTRAINT temas_shares_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.perfiles(id) ON DELETE CASCADE
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_temas_shares_tema_id ON public.temas_shares(tema_id);
CREATE INDEX IF NOT EXISTS idx_temas_shares_usuario_id ON public.temas_shares(usuario_id);
CREATE INDEX IF NOT EXISTS idx_temas_shares_fecha ON public.temas_shares(fecha_creacion);
