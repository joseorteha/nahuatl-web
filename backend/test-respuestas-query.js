const { supabase } = require('./config/database');

async function testRespuestasQuery() {
  try {
    console.log('🔍 Probando consulta de respuestas...');
    
    const temaId = 'c337bcb2-226d-4c93-b1c1-3037c87a934b';
    
    // Probar consulta simple primero
    const { data: respuestas, error } = await supabase
      .from('temas_conversacion')
      .select('id, titulo, tema_padre_id, es_respuesta')
      .eq('tema_padre_id', temaId)
      .eq('es_respuesta', true);

    if (error) {
      console.error('❌ Error en consulta simple:', error);
      return;
    }

    console.log('✅ Respuestas encontradas:', respuestas?.length || 0);
    console.log('📋 Datos:', respuestas);

    // Probar consulta completa
    const { data: respuestasCompletas, error: errorCompleta } = await supabase
      .from('temas_conversacion')
      .select(`
        id,
        titulo,
        descripcion,
        contenido,
        fecha_creacion,
        es_respuesta_admin,
        creador_id
      `)
      .eq('tema_padre_id', temaId)
      .eq('es_respuesta', true);

    if (errorCompleta) {
      console.error('❌ Error en consulta completa:', errorCompleta);
    } else {
      console.log('✅ Consulta completa exitosa');
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

testRespuestasQuery();
