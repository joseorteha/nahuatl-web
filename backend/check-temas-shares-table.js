const { supabase } = require('./config/database');

async function checkTemasSharesTable() {
  try {
    console.log('🔍 Verificando tabla temas_shares...');
    
    // Probar insertar un share
    const { data, error } = await supabase
      .from('temas_shares')
      .insert({
        tema_id: 'c337bcb2-226d-4c93-b1c1-3037c87a934b',
        usuario_id: 'af465694-6132-4c05-a58b-c974c0fcf005',
        plataforma: 'interno'
      })
      .select();

    if (error) {
      console.error('❌ Error insertando share:', error);
      
      // Si la tabla no existe, mostrar SQL para crearla
      if (error.code === '42P01') {
        console.log('📝 La tabla temas_shares no existe, creándola...');
        
        const createTableSQL = `
          CREATE TABLE IF NOT EXISTS public.temas_shares (
            id uuid NOT NULL DEFAULT gen_random_uuid(),
            tema_id uuid NOT NULL,
            usuario_id uuid NOT NULL,
            plataforma text DEFAULT 'interno' CHECK (plataforma = ANY (ARRAY['interno'::text, 'facebook'::text, 'twitter'::text, 'whatsapp'::text, 'telegram'::text, 'otro'::text])),
            fecha_creacion timestamp with time zone DEFAULT now(),
            CONSTRAINT temas_shares_pkey PRIMARY KEY (id),
            CONSTRAINT temas_shares_tema_id_fkey FOREIGN KEY (tema_id) REFERENCES public.temas_conversacion(id) ON DELETE CASCADE,
            CONSTRAINT temas_shares_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.perfiles(id) ON DELETE CASCADE
          );
        `;
        
        console.log('📋 SQL para crear tabla:');
        console.log(createTableSQL);
      }
    } else {
      console.log('✅ Tabla temas_shares existe y funciona');
      console.log('📋 Share insertado:', data);
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

checkTemasSharesTable();
