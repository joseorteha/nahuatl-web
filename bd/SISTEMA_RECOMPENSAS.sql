-- Sistema de Recompensas para Nawatlajtol
-- Todas las tablas en español

-- Tabla de recompensas de usuario (puntos, nivel, etc.)
CREATE TABLE public.recompensas_usuario (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL,
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

-- Tabla de definición de logros
CREATE TABLE public.logros (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  descripcion text NOT NULL,
  icono text NOT NULL, -- emoji o clase de icono
  categoria text DEFAULT 'general'::text CHECK (categoria = ANY (ARRAY['contribucion'::text, 'comunidad'::text, 'conocimiento'::text, 'especial'::text, 'general'::text])),
  condicion_tipo text NOT NULL CHECK (condicion_tipo = ANY (ARRAY['contribuciones_cantidad'::text, 'likes_recibidos'::text, 'dias_consecutivos'::text, 'primera_contribucion'::text, 'feedback_cantidad'::text, 'palabras_guardadas'::text])),
  condicion_valor integer NOT NULL,
  puntos_otorgados integer DEFAULT 0,
  fecha_creacion timestamp with time zone DEFAULT now(),
  CONSTRAINT logros_pkey PRIMARY KEY (id)
);

-- Tabla de logros obtenidos por usuarios
CREATE TABLE public.logros_usuario (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL,
  logro_id uuid NOT NULL,
  fecha_obtenido timestamp with time zone DEFAULT now(),
  notificado boolean DEFAULT false,
  CONSTRAINT logros_usuario_pkey PRIMARY KEY (id),
  CONSTRAINT logros_usuario_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.perfiles(id),
  CONSTRAINT logros_usuario_logro_id_fkey FOREIGN KEY (logro_id) REFERENCES public.logros(id),
  CONSTRAINT logros_usuario_unique UNIQUE (usuario_id, logro_id)
);

-- Tabla de historial de puntos (para tracking)
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

-- Insertar logros predefinidos
INSERT INTO public.logros (nombre, descripcion, icono, categoria, condicion_tipo, condicion_valor, puntos_otorgados) VALUES
-- Logros de contribución
('Primer Paso', 'Haz tu primera contribución al diccionario', '🌱', 'contribucion', 'primera_contribucion', 1, 10),
('Contribuidor Activo', 'Contribuye con 10 palabras al diccionario', '📚', 'contribucion', 'contribuciones_cantidad', 10, 50),
('Experto Lingüista', 'Contribuye con 50 palabras al diccionario', '🎓', 'contribucion', 'contribuciones_cantidad', 50, 200),
('Maestro del Náhuatl', 'Contribuye con 100 palabras al diccionario', '👑', 'contribucion', 'contribuciones_cantidad', 100, 500),

-- Logros de comunidad
('Voz de la Comunidad', 'Envía tu primer feedback', '💬', 'comunidad', 'feedback_cantidad', 1, 5),
('Comunicador', 'Envía 10 mensajes de feedback', '📢', 'comunidad', 'feedback_cantidad', 10, 25),
('Querido por Todos', 'Recibe 10 likes en tus contribuciones', '❤️', 'comunidad', 'likes_recibidos', 10, 30),
('Estrella Comunitaria', 'Recibe 50 likes en tus contribuciones', '⭐', 'comunidad', 'likes_recibidos', 50, 100),

-- Logros de conocimiento
('Coleccionista', 'Guarda tu primera palabra', '📖', 'conocimiento', 'palabras_guardadas', 1, 5),
('Bibliotecario', 'Guarda 25 palabras', '📚', 'conocimiento', 'palabras_guardadas', 25, 50),

-- Logros especiales
('Dedicado', 'Contribuye durante 7 días consecutivos', '🔥', 'especial', 'dias_consecutivos', 7, 75),
('Imparable', 'Contribuye durante 30 días consecutivos', '💪', 'especial', 'dias_consecutivos', 30, 300);

-- Crear índices para mejor performance
CREATE INDEX idx_recompensas_usuario_usuario_id ON public.recompensas_usuario(usuario_id);
CREATE INDEX idx_logros_usuario_usuario_id ON public.logros_usuario(usuario_id);
CREATE INDEX idx_historial_puntos_usuario_id ON public.historial_puntos(usuario_id);
