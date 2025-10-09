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
CREATE TABLE public.hashtags (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text NOT NULL UNIQUE CHECK (nombre ~ '^[a-zA-Z0-9_]+$'::text),
  descripcion text,
  color text DEFAULT '#3B82F6'::text,
  uso_contador integer DEFAULT 0,
  fecha_creacion timestamp with time zone DEFAULT now(),
  creado_por_id uuid,
  CONSTRAINT hashtags_pkey PRIMARY KEY (id),
  CONSTRAINT hashtags_creador_fkey FOREIGN KEY (creado_por_id) REFERENCES public.perfiles(id)
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
  condicion_tipo text NOT NULL CHECK (condicion_tipo = ANY (ARRAY['contribuciones_cantidad'::text, 'likes_recibidos'::text, 'dias_consecutivos'::text, 'primera_contribucion'::text, 'temas_cantidad'::text, 'palabras_guardadas'::text])),
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
CREATE TABLE public.menciones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  mencionador_id uuid NOT NULL,
  mencionado_id uuid NOT NULL,
  tipo_mencion text NOT NULL CHECK (tipo_mencion = ANY (ARRAY['tema'::text, 'respuesta'::text, 'like'::text])),
  fecha_mencion timestamp with time zone DEFAULT now(),
  visto boolean DEFAULT false,
  tema_id uuid,
  tema_respuesta_id uuid,
  CONSTRAINT menciones_pkey PRIMARY KEY (id),
  CONSTRAINT menciones_mencionador_fkey FOREIGN KEY (mencionador_id) REFERENCES public.perfiles(id),
  CONSTRAINT menciones_mencionado_fkey FOREIGN KEY (mencionado_id) REFERENCES public.perfiles(id),
  CONSTRAINT menciones_tema_id_fkey FOREIGN KEY (tema_id) REFERENCES public.temas_conversacion(id),
  CONSTRAINT menciones_tema_respuesta_id_fkey FOREIGN KEY (tema_respuesta_id) REFERENCES public.temas_conversacion(id)
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
CREATE TABLE public.notificaciones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL,
  tipo_notificacion text NOT NULL CHECK (tipo_notificacion = ANY (ARRAY['like_recibido'::text, 'respuesta_recibida'::text, 'tema_compartido'::text, 'ranking_actualizado'::text, 'mencion'::text, 'nuevo_seguidor'::text, 'logro_obtenido'::text, 'puntos_ganados'::text, 'contribucion_aprobada'::text, 'contribucion_rechazada'::text, 'contribucion_publicada'::text, 'tema_nuevo_categoria'::text, 'mensaje_contacto'::text, 'solicitud_union'::text])),
  titulo text NOT NULL,
  mensaje text NOT NULL,
  relacionado_id uuid,
  relacionado_tipo text CHECK (relacionado_tipo = ANY (ARRAY['tema'::text, 'respuesta'::text, 'usuario'::text, 'logro'::text, 'contribucion'::text, 'mensaje_contacto'::text, 'solicitud_union'::text])),
  fecha_creacion timestamp with time zone DEFAULT now(),
  leida boolean DEFAULT false,
  fecha_leida timestamp with time zone,
  CONSTRAINT notificaciones_pkey PRIMARY KEY (id),
  CONSTRAINT notificaciones_usuario_fkey FOREIGN KEY (usuario_id) REFERENCES public.perfiles(id)
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
  contador_temas integer DEFAULT 0,
  password text,
  rol text DEFAULT 'usuario'::text CHECK (rol = ANY (ARRAY['usuario'::text, 'moderador'::text, 'admin'::text])),
  biografia text,
  ubicacion text,
  sitio_web text,
  verificado boolean DEFAULT false,
  privacidad_perfil text DEFAULT 'publico'::text CHECK (privacidad_perfil = ANY (ARRAY['publico'::text, 'amigos'::text, 'privado'::text])),
  mostrar_puntos boolean DEFAULT true,
  mostrar_nivel boolean DEFAULT true,
  notificaciones_email boolean DEFAULT true,
  notificaciones_push boolean DEFAULT true,
  CONSTRAINT perfiles_pkey PRIMARY KEY (id)
);
CREATE TABLE public.push_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  endpoint text NOT NULL,
  p256dh text NOT NULL,
  auth text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT push_subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT push_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.perfiles(id)
);
CREATE TABLE public.ranking_social (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL,
  periodo text NOT NULL CHECK (periodo = ANY (ARRAY['semanal'::text, 'mensual'::text, 'anual'::text])),
  fecha_inicio timestamp with time zone NOT NULL,
  fecha_fin timestamp with time zone NOT NULL,
  experiencia_social integer DEFAULT 0,
  posicion integer NOT NULL,
  likes_dados integer DEFAULT 0,
  likes_recibidos integer DEFAULT 0,
  comentarios_realizados integer DEFAULT 0,
  contenido_compartido integer DEFAULT 0,
  fecha_actualizacion timestamp with time zone DEFAULT now(),
  CONSTRAINT ranking_social_pkey PRIMARY KEY (id),
  CONSTRAINT ranking_social_usuario_fkey FOREIGN KEY (usuario_id) REFERENCES public.perfiles(id)
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
  puntos_conocimiento integer DEFAULT 0,
  experiencia_social integer DEFAULT 0,
  ranking_semanal integer DEFAULT 0,
  ranking_mensual integer DEFAULT 0,
  ranking_anual integer DEFAULT 0,
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
CREATE TABLE public.seguimientos_usuarios (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  seguidor_id uuid NOT NULL,
  seguido_id uuid NOT NULL,
  fecha_seguimiento timestamp with time zone DEFAULT now(),
  notificaciones_activas boolean DEFAULT true,
  CONSTRAINT seguimientos_usuarios_pkey PRIMARY KEY (id),
  CONSTRAINT seguimientos_seguidor_fkey FOREIGN KEY (seguidor_id) REFERENCES public.perfiles(id),
  CONSTRAINT seguimientos_seguido_fkey FOREIGN KEY (seguido_id) REFERENCES public.perfiles(id)
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
CREATE TABLE public.temas_conversacion (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  descripcion text,
  categoria text NOT NULL,
  creador_id uuid NOT NULL,
  estado text DEFAULT 'activo'::text CHECK (estado = ANY (ARRAY['activo'::text, 'cerrado'::text, 'archivado'::text])),
  participantes_count integer DEFAULT 1,
  respuestas_count integer DEFAULT 0,
  ultima_actividad timestamp with time zone DEFAULT now(),
  fecha_creacion timestamp with time zone DEFAULT now(),
  contador_likes integer DEFAULT 0,
  compartido_contador integer DEFAULT 0,
  trending_score integer DEFAULT 0,
  es_tema_principal boolean DEFAULT true,
  tema_padre_id uuid,
  orden_respuesta integer DEFAULT 0,
  es_respuesta boolean DEFAULT false,
  contenido text,
  CONSTRAINT temas_conversacion_pkey PRIMARY KEY (id),
  CONSTRAINT temas_creador_fkey FOREIGN KEY (creador_id) REFERENCES public.perfiles(id),
  CONSTRAINT temas_padre_fkey FOREIGN KEY (tema_padre_id) REFERENCES public.temas_conversacion(id)
);
CREATE TABLE public.temas_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tema_id uuid NOT NULL,
  usuario_id uuid NOT NULL,
  fecha_creacion timestamp with time zone DEFAULT now(),
  CONSTRAINT temas_likes_pkey PRIMARY KEY (id),
  CONSTRAINT temas_likes_tema_id_fkey FOREIGN KEY (tema_id) REFERENCES public.temas_conversacion(id),
  CONSTRAINT temas_likes_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.perfiles(id)
);
CREATE TABLE public.temas_shares (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tema_id uuid NOT NULL,
  usuario_id uuid NOT NULL,
  plataforma text DEFAULT 'interno'::text CHECK (plataforma = ANY (ARRAY['interno'::text, 'facebook'::text, 'twitter'::text, 'whatsapp'::text, 'telegram'::text, 'otro'::text])),
  fecha_creacion timestamp with time zone DEFAULT now(),
  CONSTRAINT temas_shares_pkey PRIMARY KEY (id),
  CONSTRAINT temas_shares_tema_id_fkey FOREIGN KEY (tema_id) REFERENCES public.temas_conversacion(id),
  CONSTRAINT temas_shares_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.perfiles(id)
);