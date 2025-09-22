const { supabase } = require('./config/database');

async function debugEndpoints() {
  try {
    console.log('🔍 Debugging endpoints...');
    
    const temaId = 'c337bcb2-226d-4c93-b1c1-3037c87a934b';
    const userId = 'af465694-6132-4c05-a58b-c974c0fcf005';
    
    // 1. Verificar si el tema existe
    console.log('\n1️⃣ Verificando tema...');
    const { data: tema, error: temaError } = await supabase
      .from('temas_conversacion')
      .select('*')
      .eq('id', temaId)
      .single();
    
    if (temaError) {
      console.error('❌ Error obteniendo tema:', temaError);
      return;
    }
    console.log('✅ Tema encontrado:', tema.titulo);
    
    // 2. Verificar like existente
    console.log('\n2️⃣ Verificando like existente...');
    const { data: existingLike, error: likeError } = await supabase
      .from('temas_likes')
      .select('id')
      .eq('tema_id', temaId)
      .eq('usuario_id', userId)
      .single();
    
    if (likeError && likeError.code !== 'PGRST116') {
      console.error('❌ Error verificando like:', likeError);
    } else if (existingLike) {
      console.log('✅ Like existente encontrado:', existingLike.id);
    } else {
      console.log('✅ No hay like existente');
    }
    
    // 3. Probar operación de like
    console.log('\n3️⃣ Probando operación de like...');
    if (existingLike) {
      // Probar unlike
      console.log('🔄 Probando unlike...');
      const { error: deleteError } = await supabase
        .from('temas_likes')
        .delete()
        .eq('id', existingLike.id);
      
      if (deleteError) {
        console.error('❌ Error eliminando like:', deleteError);
      } else {
        console.log('✅ Like eliminado exitosamente');
        
        // Probar actualizar contador
        const { error: updateError } = await supabase
          .from('temas_conversacion')
          .update({
            contador_likes: supabase.raw('contador_likes - 1')
          })
          .eq('id', temaId);
        
        if (updateError) {
          console.error('❌ Error actualizando contador:', updateError);
        } else {
          console.log('✅ Contador actualizado');
        }
      }
    } else {
      // Probar like
      console.log('🔄 Probando like...');
      const { data: newLike, error: insertError } = await supabase
        .from('temas_likes')
        .insert({
          tema_id: temaId,
          usuario_id: userId
        })
        .select();
      
      if (insertError) {
        console.error('❌ Error creando like:', insertError);
      } else {
        console.log('✅ Like creado exitosamente');
        
        // Probar actualizar contador
        const { error: updateError } = await supabase
          .from('temas_conversacion')
          .update({
            contador_likes: supabase.raw('contador_likes + 1')
          })
          .eq('id', temaId);
        
        if (updateError) {
          console.error('❌ Error actualizando contador:', updateError);
        } else {
          console.log('✅ Contador actualizado');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

debugEndpoints();
