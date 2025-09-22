const { supabase } = require('./config/database');

async function checkTemasStructure() {
  try {
    console.log('🔍 Verificando estructura de temas_conversacion...');
    
    // Obtener un tema para ver su estructura
    const { data: tema, error } = await supabase
      .from('temas_conversacion')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error obteniendo tema:', error);
      return;
    }

    if (tema && tema.length > 0) {
      console.log('✅ Estructura del tema:');
      console.log(JSON.stringify(tema[0], null, 2));
    } else {
      console.log('⚠️ No hay temas en la tabla');
    }

    // Verificar si las columnas nuevas existen
    const { data: testQuery, error: testError } = await supabase
      .from('temas_conversacion')
      .select('es_tema_principal, es_respuesta, tema_padre_id, contador_likes, compartido_contador')
      .limit(1);

    if (testError) {
      console.log('❌ Columnas nuevas no existen:', testError.message);
    } else {
      console.log('✅ Columnas nuevas existen');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkTemasStructure();
