const { supabase } = require('./config/database');

async function checkTemasLikesTable() {
  try {
    console.log('🔍 Verificando tabla temas_likes...');
    
    // Probar insertar un like
    const { data, error } = await supabase
      .from('temas_likes')
      .insert({
        tema_id: 'c337bcb2-226d-4c93-b1c1-3037c87a934b',
        usuario_id: 'af465694-6132-4c05-a58b-c974c0fcf005'
      })
      .select();

    if (error) {
      console.error('❌ Error insertando like:', error);
      
      // Si la tabla no existe, crearla
      if (error.code === '42P01') {
        console.log('📝 La tabla temas_likes no existe, creándola...');
        
        // Crear la tabla
        const createTableSQL = `
          CREATE TABLE IF NOT EXISTS public.temas_likes (
            id uuid NOT NULL DEFAULT gen_random_uuid(),
            tema_id uuid NOT NULL,
            usuario_id uuid NOT NULL,
            fecha_creacion timestamp with time zone DEFAULT now(),
            CONSTRAINT temas_likes_pkey PRIMARY KEY (id),
            CONSTRAINT temas_likes_tema_id_fkey FOREIGN KEY (tema_id) REFERENCES public.temas_conversacion(id) ON DELETE CASCADE,
            CONSTRAINT temas_likes_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.perfiles(id) ON DELETE CASCADE,
            CONSTRAINT temas_likes_unique UNIQUE (tema_id, usuario_id)
          );
        `;
        
        console.log('📋 SQL para crear tabla:');
        console.log(createTableSQL);
      }
    } else {
      console.log('✅ Tabla temas_likes existe y funciona');
      console.log('📋 Like insertado:', data);
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

checkTemasLikesTable();
