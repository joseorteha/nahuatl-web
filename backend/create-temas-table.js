const { supabase } = require('./config/database');

async function createTemasTable() {
  try {
    console.log('🔄 Creando tabla temas_conversacion...');
    
    // Verificar si la tabla existe
    const { data: existingTable, error: checkError } = await supabase
      .from('temas_conversacion')
      .select('id')
      .limit(1);
    
    if (existingTable !== null) {
      console.log('✅ La tabla temas_conversacion ya existe');
      return;
    }
    
    console.log('⚠️  La tabla no existe, necesitas crearla manualmente en Supabase');
    console.log('📝 Ejecuta este SQL en el editor de Supabase:');
    console.log(`
CREATE TABLE public.temas_conversacion (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  descripcion text,
  categoria text NOT NULL,
  creador_id uuid NOT NULL,
  estado text DEFAULT 'activo' CHECK (estado = ANY (ARRAY['activo'::text, 'cerrado'::text, 'archivado'::text])),
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

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_temas_creador_id ON public.temas_conversacion(creador_id);
CREATE INDEX IF NOT EXISTS idx_temas_estado ON public.temas_conversacion(estado);
CREATE INDEX IF NOT EXISTS idx_temas_categoria ON public.temas_conversacion(categoria);
CREATE INDEX IF NOT EXISTS idx_temas_fecha_creacion ON public.temas_conversacion(fecha_creacion);
CREATE INDEX IF NOT EXISTS idx_temas_tema_padre_id ON public.temas_conversacion(tema_padre_id);
    `);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createTemasTable();
