const { supabase } = require('./config/database');

async function createTestTema() {
  try {
    console.log('🔄 Creando tema de prueba...');
    
    // Primero necesitamos un usuario para crear el tema
    const { data: usuarios, error: userError } = await supabase
      .from('perfiles')
      .select('id')
      .limit(1);
    
    if (userError || !usuarios || usuarios.length === 0) {
      console.error('❌ No hay usuarios en la base de datos');
      return;
    }
    
    const userId = usuarios[0].id;
    console.log('👤 Usuario encontrado:', userId);
    
    // Crear tema de prueba con solo las columnas que existen
    const { data: tema, error } = await supabase
      .from('temas_conversacion')
      .insert({
        titulo: '¿Cómo se dice "casa" en náhuatl?',
        descripcion: 'Estoy aprendiendo náhuatl y me gustaría saber cómo se dice "casa" y si hay variaciones regionales.',
        categoria: 'question',
        creador_id: userId,
        estado: 'activo'
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error creando tema:', error);
      return;
    }
    
    console.log('✅ Tema creado exitosamente:', tema);
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

createTestTema();
