-- SCRIPT SIMPLIFICADO PARA CORREGIR RLS
-- Ejecutar en Supabase SQL Editor

-- 1. Eliminar tablas si existen (para empezar limpio)
DROP TABLE IF EXISTS public.respuestas_contacto;
DROP TABLE IF EXISTS public.solicitudes_union;
DROP TABLE IF EXISTS public.mensajes_contacto;

-- 2. Crear tabla mensajes_contacto SIN RLS
CREATE TABLE public.mensajes_contacto (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
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
  estado text DEFAULT 'pendiente'::text CHECK (estado = ANY (ARRAY[
    'pendiente'::text,
    'leido'::text,
    'respondido'::text,
    'resuelto'::text,
    'archivado'::text
  ])),
  agente_usuario text,
  direccion_ip inet,
  url_referencia text,
  fecha_creacion timestamp with time zone DEFAULT now(),
  fecha_actualizacion timestamp with time zone DEFAULT now(),
  fecha_leido timestamp with time zone,
  fecha_respondido timestamp with time zone,
  CONSTRAINT mensajes_contacto_pkey PRIMARY KEY (id)
);

-- 3. Crear tabla solicitudes_union SIN RLS
CREATE TABLE public.solicitudes_union (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  email text NOT NULL,
  telefono text,
  tipo_union text NOT NULL CHECK (tipo_union = ANY (ARRAY[
    'registro'::text,
    'contribuir'::text,
    'comunidad'::text,
    'voluntario'::text,
    'maestro'::text,
    'traductor'::text
  ])),
  nivel_experiencia text DEFAULT 'principiante'::text CHECK (nivel_experiencia = ANY (ARRAY[
    'principiante'::text,
    'intermedio'::text,
    'avanzado'::text,
    'nativo'::text
  ])),
  motivacion text,
  habilidades text,
  disponibilidad text,
  estado text DEFAULT 'pendiente'::text CHECK (estado = ANY (ARRAY[
    'pendiente'::text,
    'aprobada'::text,
    'rechazada'::text,
    'contactado'::text,
    'completado'::text
  ])),
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

-- 4. Crear tabla respuestas_contacto SIN RLS
CREATE TABLE public.respuestas_contacto (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  mensaje_contacto_id uuid NOT NULL,
  mensaje_respuesta text NOT NULL,
  tipo_respuesta text DEFAULT 'email'::text CHECK (tipo_respuesta = ANY (ARRAY[
    'email'::text,
    'telefono'::text,
    'nota_interna'::text
  ])),
  admin_id uuid,
  email_admin text NOT NULL,
  fecha_creacion timestamp with time zone DEFAULT now(),
  fecha_envio timestamp with time zone,
  CONSTRAINT respuestas_contacto_pkey PRIMARY KEY (id),
  CONSTRAINT respuestas_contacto_mensaje_fkey FOREIGN KEY (mensaje_contacto_id) REFERENCES public.mensajes_contacto(id) ON DELETE CASCADE
);

-- 5. Crear índices
CREATE INDEX idx_mensajes_contacto_estado ON public.mensajes_contacto(estado);
CREATE INDEX idx_mensajes_contacto_tipo ON public.mensajes_contacto(tipo_contacto);
CREATE INDEX idx_mensajes_contacto_fecha ON public.mensajes_contacto(fecha_creacion DESC);
CREATE INDEX idx_mensajes_contacto_email ON public.mensajes_contacto(email);

CREATE INDEX idx_solicitudes_union_estado ON public.solicitudes_union(estado);
CREATE INDEX idx_solicitudes_union_tipo ON public.solicitudes_union(tipo_union);
CREATE INDEX idx_solicitudes_union_fecha ON public.solicitudes_union(fecha_creacion DESC);
CREATE INDEX idx_solicitudes_union_email ON public.solicitudes_union(email);

-- 6. DESHABILITAR RLS COMPLETAMENTE (para formularios públicos)
ALTER TABLE public.mensajes_contacto DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitudes_union DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.respuestas_contacto DISABLE ROW LEVEL SECURITY;

-- 7. Dar permisos completos a usuarios autenticados y anónimos
GRANT ALL ON public.mensajes_contacto TO anon;
GRANT ALL ON public.mensajes_contacto TO authenticated;
GRANT ALL ON public.solicitudes_union TO anon;
GRANT ALL ON public.solicitudes_union TO authenticated;
GRANT ALL ON public.respuestas_contacto TO anon;
GRANT ALL ON public.respuestas_contacto TO authenticated;

-- 8. Trigger para timestamps
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

-- 9. Función utilitaria
CREATE OR REPLACE FUNCTION public.obtener_mensajes_no_leidos()
RETURNS integer AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM public.mensajes_contacto WHERE estado = 'pendiente');
END;
$$ LANGUAGE plpgsql;

-- ¡LISTO! Ahora los formularios deberían funcionar sin problemas de RLS
