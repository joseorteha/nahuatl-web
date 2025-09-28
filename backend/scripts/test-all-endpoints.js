const { supabase } = require('./config/database');

async function testAllEndpoints() {
  try {
    console.log('🧪 Probando todos los endpoints...');
    
    const temaId = 'c337bcb2-226d-4c93-b1c1-3037c87a934b';
    const userId = 'af465694-6132-4c05-a58b-c974c0fcf005';
    
    // 1. Probar GET /api/temas
    console.log('\n1️⃣ Probando GET /api/temas...');
    const { data: temas, error: temasError } = await supabase
      .from('temas_conversacion')
      .select('*')
      .eq('es_tema_principal', true);
    
    if (temasError) {
      console.error('❌ Error obteniendo temas:', temasError);
    } else {
      console.log('✅ Temas obtenidos:', temas?.length || 0);
    }
    
    // 2. Probar GET /api/temas/:id
    console.log('\n2️⃣ Probando GET /api/temas/:id...');
    const { data: tema, error: temaError } = await supabase
      .from('temas_conversacion')
      .select('*')
      .eq('id', temaId)
      .single();
    
    if (temaError) {
      console.error('❌ Error obteniendo tema:', temaError);
    } else {
      console.log('✅ Tema obtenido:', tema.titulo);
    }
    
    // 3. Probar like (verificar si ya existe)
    console.log('\n3️⃣ Probando like...');
    const { data: existingLike, error: likeCheckError } = await supabase
      .from('temas_likes')
      .select('id')
      .eq('tema_id', temaId)
      .eq('usuario_id', userId)
      .single();
    
    if (likeCheckError && likeCheckError.code !== 'PGRST116') {
      console.error('❌ Error verificando like:', likeCheckError);
    } else if (existingLike) {
      console.log('✅ Like ya existe, probando unlike...');
      
      // Probar unlike
      const { error: deleteError } = await supabase
        .from('temas_likes')
        .delete()
        .eq('id', existingLike.id);
      
      if (deleteError) {
        console.error('❌ Error eliminando like:', deleteError);
      } else {
        console.log('✅ Like eliminado exitosamente');
      }
    } else {
      console.log('✅ No hay like existente, probando crear like...');
      
      // Probar crear like
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
      }
    }
    
    // 4. Probar share
    console.log('\n4️⃣ Probando share...');
    const { data: newShare, error: shareError } = await supabase
      .from('temas_shares')
      .insert({
        tema_id: temaId,
        usuario_id: userId,
        plataforma: 'interno'
      })
      .select();
    
    if (shareError) {
      console.error('❌ Error creando share:', shareError);
    } else {
      console.log('✅ Share creado exitosamente');
    }
    
    // 5. Probar respuesta
    console.log('\n5️⃣ Probando respuesta...');
    const { data: newRespuesta, error: respuestaError } = await supabase
      .from('temas_conversacion')
      .insert({
        titulo: `Respuesta de prueba a: ${tema.titulo}`,
        contenido: 'Esta es una respuesta de prueba',
        tema_padre_id: temaId,
        creador_id: userId,
        es_tema_principal: false,
        es_respuesta: true,
        estado: 'activo',
        orden_respuesta: 0
      })
      .select();
    
    if (respuestaError) {
      console.error('❌ Error creando respuesta:', respuestaError);
    } else {
      console.log('✅ Respuesta creada exitosamente');
    }
    
    console.log('\n🎉 Pruebas completadas');
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

testAllEndpoints();
