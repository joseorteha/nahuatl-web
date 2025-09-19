-- EXTENSIONES PARA RED SOCIAL DE FEEDBACK
-- Estas tablas complementan las existentes para crear una experiencia de red social

-- Tabla para seguimientos entre usuarios
CREATE TABLE public.seguimientos_usuarios (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  seguidor_id uuid NOT NULL,
  seguido_id uuid NOT NULL,
  fecha_seguimiento timestamp with time zone DEFAULT now(),
  notificaciones_activas boolean DEFAULT true,
  CONSTRAINT seguimientos_usuarios_pkey PRIMARY KEY (id),
  CONSTRAINT seguimientos_seguidor_fkey FOREIGN KEY (seguidor_id) REFERENCES public.perfiles(id) ON DELETE CASCADE,
  CONSTRAINT seguimientos_seguido_fkey FOREIGN KEY (seguido_id) REFERENCES public.perfiles(id) ON DELETE CASCADE,
  CONSTRAINT seguimientos_unique UNIQUE (seguidor_id, seguido_id),
  CONSTRAINT no_auto_seguimiento CHECK (seguidor_id != seguido_id)
);

-- Tabla para menciones en posts/respuestas
CREATE TABLE public.menciones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  mencionador_id uuid NOT NULL,
  mencionado_id uuid NOT NULL,
  retroalimentacion_id uuid,
  respuesta_id uuid,
  tipo_mencion text NOT NULL CHECK (tipo_mencion = ANY (ARRAY['post'::text, 'respuesta'::text, 'like'::text])),
  fecha_mencion timestamp with time zone DEFAULT now(),
  visto boolean DEFAULT false,
  CONSTRAINT menciones_pkey PRIMARY KEY (id),
  CONSTRAINT menciones_mencionador_fkey FOREIGN KEY (mencionador_id) REFERENCES public.perfiles(id) ON DELETE CASCADE,
  CONSTRAINT menciones_mencionado_fkey FOREIGN KEY (mencionado_id) REFERENCES public.perfiles(id) ON DELETE CASCADE,
  CONSTRAINT menciones_retroalimentacion_fkey FOREIGN KEY (retroalimentacion_id) REFERENCES public.retroalimentacion(id) ON DELETE CASCADE,
  CONSTRAINT menciones_respuesta_fkey FOREIGN KEY (respuesta_id) REFERENCES public.retroalimentacion_respuestas(id) ON DELETE CASCADE
);

-- Tabla para notificaciones del sistema
CREATE TABLE public.notificaciones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL,
  tipo_notificacion text NOT NULL CHECK (tipo_notificacion = ANY (ARRAY[
    'like_recibido'::text, 
    'respuesta_recibida'::text, 
    'mencion'::text, 
    'nuevo_seguidor'::text, 
    'logro_obtenido'::text,
    'feedback_aprobado'::text,
    'feedback_rechazado'::text,
    'puntos_ganados'::text
  ])),
  titulo text NOT NULL,
  mensaje text NOT NULL,
  relacionado_id uuid, -- ID del objeto relacionado (feedback, respuesta, etc.)
  relacionado_tipo text CHECK (relacionado_tipo = ANY (ARRAY['feedback'::text, 'respuesta'::text, 'usuario'::text, 'logro'::text])),
  fecha_creacion timestamp with time zone DEFAULT now(),
  leida boolean DEFAULT false,
  fecha_leida timestamp with time zone,
  CONSTRAINT notificaciones_pkey PRIMARY KEY (id),
  CONSTRAINT notificaciones_usuario_fkey FOREIGN KEY (usuario_id) REFERENCES public.perfiles(id) ON DELETE CASCADE
);

-- Tabla para hashtags/etiquetas
CREATE TABLE public.hashtags (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text NOT NULL UNIQUE,
  descripcion text,
  color text DEFAULT '#3B82F6', -- Azul por defecto
  uso_contador integer DEFAULT 0,
  fecha_creacion timestamp with time zone DEFAULT now(),
  creado_por_id uuid,
  CONSTRAINT hashtags_pkey PRIMARY KEY (id),
  CONSTRAINT hashtags_creador_fkey FOREIGN KEY (creado_por_id) REFERENCES public.perfiles(id),
  CONSTRAINT hashtag_nombre_formato CHECK (nombre ~ '^[a-zA-Z0-9_]+$') -- Solo letras, números y guiones bajos
);

-- Tabla de relación entre feedback y hashtags
CREATE TABLE public.retroalimentacion_hashtags (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  retroalimentacion_id uuid NOT NULL,
  hashtag_id uuid NOT NULL,
  fecha_asociacion timestamp with time zone DEFAULT now(),
  CONSTRAINT retroalimentacion_hashtags_pkey PRIMARY KEY (id),
  CONSTRAINT rh_retroalimentacion_fkey FOREIGN KEY (retroalimentacion_id) REFERENCES public.retroalimentacion(id) ON DELETE CASCADE,
  CONSTRAINT rh_hashtag_fkey FOREIGN KEY (hashtag_id) REFERENCES public.hashtags(id) ON DELETE CASCADE,
  CONSTRAINT rh_unique UNIQUE (retroalimentacion_id, hashtag_id)
);

-- Tabla para compartir/repost de feedback
CREATE TABLE public.feedback_compartidos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL, -- Quien comparte
  retroalimentacion_id uuid NOT NULL, -- Qué comparte
  comentario_compartir text, -- Comentario al compartir
  fecha_compartido timestamp with time zone DEFAULT now(),
  CONSTRAINT feedback_compartidos_pkey PRIMARY KEY (id),
  CONSTRAINT fc_usuario_fkey FOREIGN KEY (usuario_id) REFERENCES public.perfiles(id) ON DELETE CASCADE,
  CONSTRAINT fc_retroalimentacion_fkey FOREIGN KEY (retroalimentacion_id) REFERENCES public.retroalimentacion(id) ON DELETE CASCADE
);

-- Tabla para guardar feedback favorito
CREATE TABLE public.feedback_guardados (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL,
  retroalimentacion_id uuid NOT NULL,
  fecha_guardado timestamp with time zone DEFAULT now(),
  notas_personales text,
  CONSTRAINT feedback_guardados_pkey PRIMARY KEY (id),
  CONSTRAINT fg_usuario_fkey FOREIGN KEY (usuario_id) REFERENCES public.perfiles(id) ON DELETE CASCADE,
  CONSTRAINT fg_retroalimentacion_fkey FOREIGN KEY (retroalimentacion_id) REFERENCES public.retroalimentacion(id) ON DELETE CASCADE,
  CONSTRAINT fg_unique UNIQUE (usuario_id, retroalimentacion_id)
);

-- Extender tabla de perfiles para red social
ALTER TABLE public.perfiles 
ADD COLUMN IF NOT EXISTS biografia text,
ADD COLUMN IF NOT EXISTS ubicacion text,
ADD COLUMN IF NOT EXISTS sitio_web text,
ADD COLUMN IF NOT EXISTS verificado boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS privacidad_perfil text DEFAULT 'publico'::text CHECK (privacidad_perfil = ANY (ARRAY['publico'::text, 'amigos'::text, 'privado'::text])),
ADD COLUMN IF NOT EXISTS mostrar_puntos boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS mostrar_nivel boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS notificaciones_email boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS notificaciones_push boolean DEFAULT true;

-- Extender tabla de retroalimentación para red social
ALTER TABLE public.retroalimentacion 
ADD COLUMN IF NOT EXISTS hashtags text[], -- Array de hashtags para búsqueda rápida
ADD COLUMN IF NOT EXISTS compartido_contador integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS guardado_contador integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS trending_score decimal DEFAULT 0, -- Para calcular trending
ADD COLUMN IF NOT EXISTS visibilidad text DEFAULT 'publico'::text CHECK (visibilidad = ANY (ARRAY['publico'::text, 'seguidores'::text, 'privado'::text])),
ADD COLUMN IF NOT EXISTS permite_compartir boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS archivado boolean DEFAULT false;

-- Índices para optimizar consultas de red social
CREATE INDEX IF NOT EXISTS idx_seguimientos_seguidor ON public.seguimientos_usuarios(seguidor_id);
CREATE INDEX IF NOT EXISTS idx_seguimientos_seguido ON public.seguimientos_usuarios(seguido_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario_leida ON public.notificaciones(usuario_id, leida);
CREATE INDEX IF NOT EXISTS idx_notificaciones_fecha ON public.notificaciones(fecha_creacion DESC);
CREATE INDEX IF NOT EXISTS idx_menciones_mencionado ON public.menciones(mencionado_id, visto);
CREATE INDEX IF NOT EXISTS idx_hashtags_nombre ON public.hashtags(nombre);
CREATE INDEX IF NOT EXISTS idx_retroalimentacion_hashtags ON public.retroalimentacion(hashtags) USING GIN;
CREATE INDEX IF NOT EXISTS idx_retroalimentacion_trending ON public.retroalimentacion(trending_score DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_guardados_usuario ON public.feedback_guardados(usuario_id);

-- Funciones para automatizar contadores
CREATE OR REPLACE FUNCTION actualizar_contador_hashtag()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.hashtags 
    SET uso_contador = uso_contador + 1 
    WHERE id = NEW.hashtag_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.hashtags 
    SET uso_contador = GREATEST(uso_contador - 1, 0) 
    WHERE id = OLD.hashtag_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar contador de hashtags
CREATE TRIGGER trigger_actualizar_contador_hashtag
  AFTER INSERT OR DELETE ON public.retroalimentacion_hashtags
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_contador_hashtag();

-- Función para calcular trending score
CREATE OR REPLACE FUNCTION calcular_trending_score()
RETURNS TRIGGER AS $$
BEGIN
  -- Score basado en likes, respuestas, tiempo y actividad reciente
  NEW.trending_score = (
    NEW.contador_likes * 2 + 
    (SELECT COUNT(*) FROM public.retroalimentacion_respuestas WHERE retroalimentacion_id = NEW.id) * 3 +
    NEW.compartido_contador * 1.5 +
    -- Bonus por ser reciente (últimas 24 horas)
    CASE 
      WHEN NEW.fecha_creacion > NOW() - INTERVAL '24 hours' THEN 10 
      WHEN NEW.fecha_creacion > NOW() - INTERVAL '7 days' THEN 5
      ELSE 0 
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para calcular trending automáticamente
CREATE TRIGGER trigger_calcular_trending
  BEFORE INSERT OR UPDATE ON public.retroalimentacion
  FOR EACH ROW
  EXECUTE FUNCTION calcular_trending_score();

-- Comentarios para documentación
COMMENT ON TABLE public.seguimientos_usuarios IS 'Gestiona las relaciones de seguimiento entre usuarios para crear feeds personalizados';
COMMENT ON TABLE public.notificaciones IS 'Sistema de notificaciones para mantener a los usuarios informados de actividad relevante';
COMMENT ON TABLE public.hashtags IS 'Sistema de etiquetas para categorizar y descubrir contenido';
COMMENT ON TABLE public.menciones IS 'Registro de menciones entre usuarios para notificaciones';
COMMENT ON TABLE public.feedback_compartidos IS 'Sistema de compartir/repost para amplificar contenido valioso';
COMMENT ON TABLE public.feedback_guardados IS 'Permite a usuarios guardar feedback interesante para referencia futura';

COMMENT ON COLUMN public.retroalimentacion.trending_score IS 'Score calculado automáticamente para mostrar contenido trending';
COMMENT ON COLUMN public.retroalimentacion.hashtags IS 'Array desnormalizado de hashtags para búsqueda rápida';
COMMENT ON COLUMN public.perfiles.verificado IS 'Indica si el usuario ha sido verificado por el equipo';
COMMENT ON COLUMN public.perfiles.privacidad_perfil IS 'Nivel de privacidad del perfil del usuario';