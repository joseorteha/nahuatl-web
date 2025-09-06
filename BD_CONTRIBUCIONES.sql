-- NUEVA FUNCIONALIDAD: Sistema de contribuciones de palabras
-- Para agregar a BD_ESPAÑOL.sql

-- Tabla de contribuciones pendientes
CREATE TABLE public.contribuciones_diccionario (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  
  -- Usuario que contribuye
  usuario_id uuid NOT NULL,
  usuario_email text NOT NULL, -- Para notificaciones
  
  -- Datos de la palabra propuesta
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
  
  -- Estado de la contribución
  estado text DEFAULT 'pendiente'::text CHECK (estado = ANY (ARRAY[
    'pendiente'::text,     -- Esperando revisión
    'aprobada'::text,      -- Aprobada por admin
    'rechazada'::text,     -- Rechazada por admin
    'publicada'::text      -- Ya añadida al diccionario principal
  ])),
  
  -- Datos de administración
  admin_revisor_id uuid, -- ID del admin que revisó
  comentarios_admin text, -- Comentarios del admin
  fecha_revision timestamp with time zone,
  
  -- Metadatos
  razon_contribucion text, -- Por qué quiere agregar esta palabra
  fuente text, -- De dónde sacó la información
  nivel_confianza text DEFAULT 'medio'::text CHECK (nivel_confianza = ANY (ARRAY[
    'bajo'::text,    -- Usuario novato
    'medio'::text,   -- Usuario regular
    'alto'::text     -- Usuario experto/nativo
  ])),
  
  -- Timestamps
  fecha_creacion timestamp with time zone DEFAULT now(),
  fecha_actualizacion timestamp with time zone DEFAULT now(),
  
  CONSTRAINT contribuciones_diccionario_pkey PRIMARY KEY (id),
  CONSTRAINT contribuciones_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.perfiles(id),
  CONSTRAINT contribuciones_admin_revisor_fkey FOREIGN KEY (admin_revisor_id) REFERENCES public.perfiles(id)
);

-- Agregar campo de rol a la tabla perfiles para identificar admins
ALTER TABLE public.perfiles 
ADD COLUMN rol text DEFAULT 'usuario'::text CHECK (rol = ANY (ARRAY[
  'usuario'::text,
  'moderador'::text, 
  'admin'::text
]));

-- Índices para optimizar consultas
CREATE INDEX idx_contribuciones_estado ON public.contribuciones_diccionario(estado);
CREATE INDEX idx_contribuciones_usuario ON public.contribuciones_diccionario(usuario_id);
CREATE INDEX idx_contribuciones_fecha ON public.contribuciones_diccionario(fecha_creacion);
CREATE INDEX idx_perfiles_rol ON public.perfiles(rol);

-- Función para notificar al usuario cuando su contribución cambia de estado
CREATE OR REPLACE FUNCTION notificar_cambio_contribucion()
RETURNS TRIGGER AS $$
BEGIN
  -- Aquí se podría integrar con un sistema de notificaciones
  -- Por ahora solo actualizamos la fecha
  NEW.fecha_actualizacion = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para la función
CREATE TRIGGER trigger_notificar_contribucion
  BEFORE UPDATE ON public.contribuciones_diccionario
  FOR EACH ROW
  EXECUTE FUNCTION notificar_cambio_contribucion();

-- Política de seguridad RLS (Row Level Security)
ALTER TABLE public.contribuciones_diccionario ENABLE ROW LEVEL SECURITY;

-- Los usuarios solo pueden ver sus propias contribuciones
CREATE POLICY "usuarios_ven_sus_contribuciones" ON public.contribuciones_diccionario
  FOR SELECT USING (auth.uid() = usuario_id);

-- Los usuarios pueden insertar sus propias contribuciones
CREATE POLICY "usuarios_pueden_contribuir" ON public.contribuciones_diccionario
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- Solo admins pueden actualizar el estado
CREATE POLICY "admins_pueden_revisar" ON public.contribuciones_diccionario
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.perfiles 
      WHERE id = auth.uid() 
      AND rol IN ('admin', 'moderador')
    )
  );

-- Solo admins pueden ver todas las contribuciones
CREATE POLICY "admins_ven_todas_contribuciones" ON public.contribuciones_diccionario
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.perfiles 
      WHERE id = auth.uid() 
      AND rol IN ('admin', 'moderador')
    )
  );
