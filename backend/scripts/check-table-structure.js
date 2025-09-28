const { supabase } = require('./config/database');

async function checkTableStructure() {
  try {
    console.log('🔍 Verificando estructura de la tabla temas_conversacion...');
    
    // Intentar obtener la estructura de la tabla
    const { data, error } = await supabase
      .from('temas_conversacion')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error al acceder a la tabla:', error);
      return;
    }
    
    console.log('✅ Tabla accesible');
    console.log('📊 Datos de muestra:', data);
    
    // Verificar columnas específicas
    const { data: testData, error: testError } = await supabase
      .from('temas_conversacion')
      .select('id, titulo, categoria, creador_id, estado, fecha_creacion')
      .limit(1);
    
    if (testError) {
      console.error('❌ Error en consulta específica:', testError);
    } else {
      console.log('✅ Columnas básicas funcionan');
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

checkTableStructure();
