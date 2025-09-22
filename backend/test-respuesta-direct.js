const { supabase } = require('./config/database');

async function testRespuestaDirect() {
  try {
    console.log('🧪 Probando creación de respuesta directa...');
    
    const temaId = 'c337bcb2-226d-4c93-b1c1-3037c87a934b';
    const userId = 'af465694-6132-4c05-a58b-c974c0fcf005';
    const contenido = 'Esta es una respuesta de prueba directa';
    
    // Primero obtener el tema para usar su categoría
    const { data: tema, error: temaError } = await supabase
      .from('temas_conversacion')
      .select('titulo, categoria')
      .eq('id', temaId)
      .single();
    
    if (temaError) {
      console.error('❌ Error obteniendo tema:', temaError);
      return;
    }
    
    console.log('✅ Tema obtenido:', tema);
    
    // Crear respuesta
    const { data: respuesta, error: insertError } = await supabase
      .from('temas_conversacion')
      .insert({
        titulo: `Respuesta a: ${tema.titulo}`,
        descripcion: `Respuesta a: ${tema.titulo}`,
        contenido,
        categoria: tema.categoria,
        tema_padre_id: temaId,
        creador_id: userId,
        es_tema_principal: false,
        es_respuesta: true,
        estado: 'activo',
        orden_respuesta: 0
      })
      .select('*')
      .single();
    
    if (insertError) {
      console.error('❌ Error creando respuesta:', insertError);
    } else {
      console.log('✅ Respuesta creada exitosamente:', respuesta);
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

testRespuestaDirect();
