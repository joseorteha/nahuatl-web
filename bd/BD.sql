-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.contribuciones_diccionario (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL,
  usuario_email text NOT NULL,
  word text NOT NULL,
  variants ARRAY,
  info_gramatical text,
  definition text NOT NULL,
  nombre_cientifico text,
  examples jsonb,
  synonyms ARRAY,
  roots ARRAY,
  ver_tambien ARRAY,
  ortografias_alternativas ARRAY,
  notes ARRAY,
  estado text DEFAULT 'pendiente'::text CHECK (estado = ANY (ARRAY['pendiente'::text, 'aprobada'::text, 'rechazada'::text, 'publicada'::text])),
  admin_revisor_id uuid,
  comentarios_admin text,
  fecha_revision timestamp with time zone,
  razon_contribucion text,
  fuente text,
  nivel_confianza text DEFAULT 'medio'::text CHECK (nivel_confianza = ANY (ARRAY['bajo'::text, 'medio'::text, 'alto'::text])),
  fecha_creacion timestamp with time zone DEFAULT now(),
  fecha_actualizacion timestamp with time zone DEFAULT now(),
  CONSTRAINT contribuciones_diccionario_pkey PRIMARY KEY (id),
  CONSTRAINT contribuciones_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.perfiles(id),
  CONSTRAINT contribuciones_admin_revisor_fkey FOREIGN KEY (admin_revisor_id) REFERENCES public.perfiles(id)
);
CREATE TABLE public.diccionario (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  word text NOT NULL,
  variants ARRAY,
  info_gramatical text,
  definition text NOT NULL,
  nombre_cientifico text,
  examples jsonb,
  synonyms ARRAY,
  roots ARRAY,
  ver_tambien ARRAY,
  ortografias_alternativas ARRAY,
  notes ARRAY,
  fecha_creacion timestamp with time zone DEFAULT now(),
  fecha_actualizacion timestamp with time zone DEFAULT now(),
  usuario_id uuid,
  CONSTRAINT diccionario_pkey PRIMARY KEY (id),
  CONSTRAINT diccionario_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.perfiles(id)
);
CREATE TABLE public.historial_puntos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL,
  puntos_ganados integer NOT NULL,
  motivo text NOT NULL,
  descripcion text,
  fecha_creacion timestamp with time zone DEFAULT now(),
  CONSTRAINT historial_puntos_pkey PRIMARY KEY (id),
  CONSTRAINT historial_puntos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.perfiles(id)
);
CREATE TABLE public.logros (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  descripcion text NOT NULL,
  icono text NOT NULL,
  categoria text DEFAULT 'general'::text CHECK (categoria = ANY (ARRAY['contribucion'::text, 'comunidad'::text, 'conocimiento'::text, 'especial'::text, 'general'::text])),
  condicion_tipo text NOT NULL CHECK (condicion_tipo = ANY (ARRAY['contribuciones_cantidad'::text, 'likes_recibidos'::text, 'dias_consecutivos'::text, 'primera_contribucion'::text, 'feedback_cantidad'::text, 'palabras_guardadas'::text])),
  condicion_valor integer NOT NULL,
  puntos_otorgados integer DEFAULT 0,
  fecha_creacion timestamp with time zone DEFAULT now(),
  CONSTRAINT logros_pkey PRIMARY KEY (id)
);
CREATE TABLE public.logros_usuario (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL,
  logro_id uuid NOT NULL,
  fecha_obtenido timestamp with time zone DEFAULT now(),
  notificado boolean DEFAULT false,
  CONSTRAINT logros_usuario_pkey PRIMARY KEY (id),
  CONSTRAINT logros_usuario_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.perfiles(id),
  CONSTRAINT logros_usuario_logro_id_fkey FOREIGN KEY (logro_id) REFERENCES public.logros(id)
);
CREATE TABLE public.mensajes_contacto (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  email text NOT NULL,
  telefono text,
  asunto text NOT NULL,
  mensaje text NOT NULL,
  tipo_contacto text NOT NULL CHECK (tipo_contacto = ANY (ARRAY['email'::text, 'chat'::text, 'general'::text])),
  estado text DEFAULT 'pendiente'::text CHECK (estado = ANY (ARRAY['pendiente'::text, 'leido'::text, 'respondido'::text, 'resuelto'::text, 'archivado'::text])),
  agente_usuario text,
  direccion_ip inet,
  url_referencia text,
  fecha_creacion timestamp with time zone DEFAULT now(),
  fecha_actualizacion timestamp with time zone DEFAULT now(),
  fecha_leido timestamp with time zone,
  fecha_respondido timestamp with time zone,
  CONSTRAINT mensajes_contacto_pkey PRIMARY KEY (id)
);
CREATE TABLE public.palabras_guardadas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL,
  diccionario_id uuid NOT NULL,
  fecha_creacion timestamp with time zone DEFAULT now(),
  CONSTRAINT palabras_guardadas_pkey PRIMARY KEY (id),
  CONSTRAINT palabras_guardadas_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.perfiles(id),
  CONSTRAINT palabras_guardadas_diccionario_id_fkey FOREIGN KEY (diccionario_id) REFERENCES public.diccionario(id)
);
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
  rol text DEFAULT 'usuario'::text CHECK (rol = ANY (ARRAY['usuario'::text, 'moderador'::text, 'admin'::text])),
  CONSTRAINT perfiles_pkey PRIMARY KEY (id)
);
CREATE TABLE public.recompensas_usuario (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL UNIQUE,
  puntos_totales integer DEFAULT 0,
  nivel text DEFAULT 'principiante'::text CHECK (nivel = ANY (ARRAY['principiante'::text, 'contribuidor'::text, 'experto'::text, 'maestro'::text, 'leyenda'::text])),
  experiencia integer DEFAULT 0,
  contribuciones_aprobadas integer DEFAULT 0,
  likes_recibidos integer DEFAULT 0,
  racha_dias integer DEFAULT 0,
  fecha_creacion timestamp with time zone DEFAULT now(),
  fecha_actualizacion timestamp with time zone DEFAULT now(),
  CONSTRAINT recompensas_usuario_pkey PRIMARY KEY (id),
  CONSTRAINT recompensas_usuario_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.perfiles(id)
);
CREATE TABLE public.respuestas_contacto (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  mensaje_contacto_id uuid NOT NULL,
  mensaje_respuesta text NOT NULL,
  tipo_respuesta text DEFAULT 'email'::text CHECK (tipo_respuesta = ANY (ARRAY['email'::text, 'telefono'::text, 'nota_interna'::text])),
  admin_id uuid,
  email_admin text NOT NULL,
  fecha_creacion timestamp with time zone DEFAULT now(),
  fecha_envio timestamp with time zone,
  CONSTRAINT respuestas_contacto_pkey PRIMARY KEY (id),
  CONSTRAINT respuestas_contacto_mensaje_fkey FOREIGN KEY (mensaje_contacto_id) REFERENCES public.mensajes_contacto(id)
);
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
CREATE TABLE public.retroalimentacion_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  retroalimentacion_id uuid NOT NULL,
  usuario_id uuid NOT NULL,
  fecha_creacion timestamp with time zone DEFAULT now(),
  CONSTRAINT retroalimentacion_likes_pkey PRIMARY KEY (id),
  CONSTRAINT retroalimentacion_likes_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.perfiles(id),
  CONSTRAINT retroalimentacion_likes_retroalimentacion_id_fkey FOREIGN KEY (retroalimentacion_id) REFERENCES public.retroalimentacion(id)
);
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
CREATE TABLE public.solicitudes_union (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  email text NOT NULL,
  telefono text,
  tipo_union text NOT NULL CHECK (tipo_union = ANY (ARRAY['registro'::text, 'contribuir'::text, 'comunidad'::text, 'voluntario'::text, 'maestro'::text, 'traductor'::text])),
  nivel_experiencia text DEFAULT 'principiante'::text CHECK (nivel_experiencia = ANY (ARRAY['principiante'::text, 'intermedio'::text, 'avanzado'::text, 'nativo'::text])),
  motivacion text,
  habilidades text,
  disponibilidad text,
  estado text DEFAULT 'pendiente'::text CHECK (estado = ANY (ARRAY['pendiente'::text, 'aprobada'::text, 'rechazada'::text, 'contactado'::text, 'completado'::text])),
  notas_admin text,
  fecha_seguimiento timestamp with time zone,
  agente_usuario text,
  direccion_ip inet,
  url_referencia text,
  fecha_creacion timestamp with time zone DEFAULT now(),
  fecha_actualizacion timestamp with time zone DEFAULT now(),
  fecha_revision timestamp with time zone,
  fecha_contacto timestamp with time zone,
  CONSTRAINT solicitudes_union_pkey PRIMARY KEY (id)
);