-- WARNING: Este schema está en español y utiliza snake_case
-- Aplica estos cambios en Supabase DESPUÉS de actualizar todo el código

-- Tabla de perfiles de usuario
CREATE TABLE public.perfiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre_completo text NOT NULL,
  email text NOT NULL UNIQUE,
  username text UNIQUE,
  url_avatar text,
  fecha_creacion timestamp with time zone DEFAULT now(),
  fecha_actualizacion timestamp with time zone DEFAULT now(),
  es_beta_tester boolean DEFAULT false,
  contador_feedback integer DEFAULT 0,
  password text,
  CONSTRAINT perfiles_pkey PRIMARY KEY (id)
);

-- Tabla del diccionario náhuatl
CREATE TABLE public.diccionario (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  word text NOT NULL,
  variants text[],
  info_gramatical text,
  definition text NOT NULL,
  nombre_cientifico text,
  examples jsonb,
  synonyms text[],
  roots text[],
  ver_tambien text[],
  ortografias_alternativas text[],
  notes text[],
  fecha_creacion timestamp with time zone DEFAULT now(),
  fecha_actualizacion timestamp with time zone DEFAULT now(),
  usuario_id uuid,
  CONSTRAINT diccionario_pkey PRIMARY KEY (id),
  CONSTRAINT diccionario_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.perfiles(id)
);

-- Tabla de retroalimentación/feedback
CREATE TABLE public.retroalimentacion (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL,
  titulo text NOT NULL,
  contenido text NOT NULL,
  categoria text DEFAULT 'general'::text CHECK (categoria = ANY (ARRAY['suggestion'::text, 'question'::text, 'issue'::text, 'other'::text, 'bug_report'::text, 'feature_request'::text, 'general'::text])),
  estado text DEFAULT 'pending'::text CHECK (estado = ANY (ARRAY['pending'::text, 'reviewed'::text, 'implemented'::text, 'declined'::text])),
  prioridad text DEFAULT 'medium'::text CHECK (prioridad = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text])),
  contador_likes integer DEFAULT 0,
  fecha_creacion timestamp with time zone DEFAULT now(),
  fecha_actualizacion timestamp with time zone DEFAULT now(),
  CONSTRAINT retroalimentacion_pkey PRIMARY KEY (id),
  CONSTRAINT retroalimentacion_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.perfiles(id)
);

-- Tabla de likes de retroalimentación
CREATE TABLE public.retroalimentacion_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  retroalimentacion_id uuid NOT NULL,
  usuario_id uuid NOT NULL,
  fecha_creacion timestamp with time zone DEFAULT now(),
  CONSTRAINT retroalimentacion_likes_pkey PRIMARY KEY (id),
  CONSTRAINT retroalimentacion_likes_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.perfiles(id),
  CONSTRAINT retroalimentacion_likes_retroalimentacion_id_fkey FOREIGN KEY (retroalimentacion_id) REFERENCES public.retroalimentacion(id)
);

-- Tabla de respuestas de retroalimentación
CREATE TABLE public.retroalimentacion_respuestas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  retroalimentacion_id uuid NOT NULL,
  usuario_id uuid NOT NULL,
  contenido text NOT NULL,
  es_respuesta_admin boolean DEFAULT false,
  fecha_creacion timestamp with time zone DEFAULT now(),
  fecha_actualizacion timestamp with time zone DEFAULT now(),
  CONSTRAINT retroalimentacion_respuestas_pkey PRIMARY KEY (id),
  CONSTRAINT retroalimentacion_respuestas_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.perfiles(id),
  CONSTRAINT retroalimentacion_respuestas_retroalimentacion_id_fkey FOREIGN KEY (retroalimentacion_id) REFERENCES public.retroalimentacion(id)
);

-- Tabla de palabras guardadas por usuarios
CREATE TABLE public.palabras_guardadas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL,
  diccionario_id uuid NOT NULL,
  fecha_creacion timestamp with time zone DEFAULT now(),
  CONSTRAINT palabras_guardadas_pkey PRIMARY KEY (id),
  CONSTRAINT palabras_guardadas_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.perfiles(id),
  CONSTRAINT palabras_guardadas_diccionario_id_fkey FOREIGN KEY (diccionario_id) REFERENCES public.diccionario(id)
);

