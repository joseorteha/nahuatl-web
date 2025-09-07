-- NUEVAS TABLAS: Sistema de formularios de contacto y unirse
-- Para agregar a la base de datos principal (EN ESPAÑOL)

-- Tabla para mensajes de contacto (ContactModal)
CREATE TABLE public.mensajes_contacto (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  
  -- Información del contacto
  nombre text NOT NULL,
  email text NOT NULL,
  telefono text,
  asunto text NOT NULL,
  mensaje text NOT NULL,
  tipo_contacto text NOT NULL CHECK (tipo_contacto = ANY (ARRAY[
    'email'::text,
    'chat'::text,
    'general'::text
  ])),
  
  -- Estado del mensaje
  estado text DEFAULT 'pendiente'::text CHECK (estado = ANY (ARRAY[
    'pendiente'::text,   -- Sin leer
    'leido'::text,       -- Leído
    'respondido'::text,  -- Respondido
    'resuelto'::text,    -- Resuelto
    'archivado'::text    -- Archivado
  ])),
  
  -- Metadatos
  agente_usuario text, -- Info del navegador
  direccion_ip inet,   -- IP del usuario
  url_referencia text, -- De qué página vino
  
  -- Timestamps
  fecha_creacion timestamp with time zone DEFAULT now(),
  fecha_actualizacion timestamp with time zone DEFAULT now(),
  fecha_leido timestamp with time zone,
  fecha_respondido timestamp with time zone,
  
  CONSTRAINT mensajes_contacto_pkey PRIMARY KEY (id)
);

-- Tabla para solicitudes de unirse (JoinModal)
CREATE TABLE public.solicitudes_union (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  
  -- Información del solicitante
  nombre text NOT NULL,
  email text NOT NULL,
  telefono text,
  
  -- Tipo de participación
  tipo_union text NOT NULL CHECK (tipo_union = ANY (ARRAY[
    'registro'::text,     -- Registro normal
    'contribuir'::text,   -- Quiere contribuir
    'comunidad'::text,    -- Unirse a la comunidad
    'voluntario'::text,   -- Voluntariado
    'maestro'::text,      -- Profesor/educador
    'traductor'::text     -- Traductor
  ])),
  
  -- Información adicional
  nivel_experiencia text DEFAULT 'principiante'::text CHECK (nivel_experiencia = ANY (ARRAY[
    'principiante'::text,  -- Principiante
    'intermedio'::text,    -- Intermedio
    'avanzado'::text,      -- Avanzado
    'nativo'::text         -- Hablante nativo
  ])),
  
  motivacion text,       -- Por qué quiere unirse
  habilidades text,      -- Habilidades que puede aportar
  disponibilidad text,   -- Disponibilidad de tiempo
  
  -- Estado de la solicitud
  estado text DEFAULT 'pendiente'::text CHECK (estado = ANY (ARRAY[
    'pendiente'::text,     -- Pendiente de revisión
    'aprobada'::text,      -- Aprobado
    'rechazada'::text,     -- Rechazado
    'contactado'::text,    -- Ya se le contactó
    'completado'::text     -- Proceso completado
  ])),
  
  -- Información de seguimiento
  notas_admin text,
  fecha_seguimiento timestamp with time zone,
  
  -- Metadatos
  agente_usuario text,
  direccion_ip inet,
  url_referencia text,
  
  -- Timestamps
  fecha_creacion timestamp with time zone DEFAULT now(),
  fecha_actualizacion timestamp with time zone DEFAULT now(),
  fecha_revision timestamp with time zone,
  fecha_contacto timestamp with time zone,
  
  CONSTRAINT solicitudes_union_pkey PRIMARY KEY (id)
);

-- Tabla para respuestas a mensajes de contacto
CREATE TABLE public.respuestas_contacto (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  mensaje_contacto_id uuid NOT NULL,
  
  -- Contenido de la respuesta
  mensaje_respuesta text NOT NULL,
  tipo_respuesta text DEFAULT 'email'::text CHECK (tipo_respuesta = ANY (ARRAY[
    'email'::text,
    'telefono'::text,
    'nota_interna'::text
  ])),
  
  -- Información del admin que responde
  admin_id uuid, -- Si tienes tabla de admins
  email_admin text NOT NULL,
  
  -- Timestamps
  fecha_creacion timestamp with time zone DEFAULT now(),
  fecha_envio timestamp with time zone,
  
  CONSTRAINT respuestas_contacto_pkey PRIMARY KEY (id),
  CONSTRAINT respuestas_contacto_mensaje_fkey FOREIGN KEY (mensaje_contacto_id) REFERENCES public.mensajes_contacto(id) ON DELETE CASCADE
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_mensajes_contacto_estado ON public.mensajes_contacto(estado);
CREATE INDEX idx_mensajes_contacto_tipo ON public.mensajes_contacto(tipo_contacto);
CREATE INDEX idx_mensajes_contacto_fecha ON public.mensajes_contacto(fecha_creacion DESC);
CREATE INDEX idx_mensajes_contacto_email ON public.mensajes_contacto(email);

CREATE INDEX idx_solicitudes_union_estado ON public.solicitudes_union(estado);
CREATE INDEX idx_solicitudes_union_tipo ON public.solicitudes_union(tipo_union);
CREATE INDEX idx_solicitudes_union_fecha ON public.solicitudes_union(fecha_creacion DESC);
CREATE INDEX idx_solicitudes_union_email ON public.solicitudes_union(email);

-- RLS (Row Level Security) policies si es necesario
ALTER TABLE public.mensajes_contacto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitudes_union ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.respuestas_contacto ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (ajustar según tus necesidades)
-- Permitir inserción a todos (para formularios públicos)
CREATE POLICY "Permitir insertar mensajes contacto" ON public.mensajes_contacto
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir insertar solicitudes union" ON public.solicitudes_union
  FOR INSERT WITH CHECK (true);

-- Solo admins pueden leer/actualizar (ejemplo - ajustar según tu sistema de auth)
-- CREATE POLICY "Permitir lectura admin mensajes" ON public.mensajes_contacto
--   FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Funciones de utilidad en español
CREATE OR REPLACE FUNCTION public.marcar_contacto_como_leido(mensaje_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.mensajes_contacto 
  SET estado = 'leido', fecha_leido = now(), fecha_actualizacion = now()
  WHERE id = mensaje_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.obtener_mensajes_no_leidos()
RETURNS integer AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM public.mensajes_contacto WHERE estado = 'pendiente');
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar timestamps
CREATE OR REPLACE FUNCTION actualizar_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER actualizar_mensajes_contacto_fecha
    BEFORE UPDATE ON public.mensajes_contacto
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_actualizacion();

CREATE TRIGGER actualizar_solicitudes_union_fecha
    BEFORE UPDATE ON public.solicitudes_union
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_actualizacion();
