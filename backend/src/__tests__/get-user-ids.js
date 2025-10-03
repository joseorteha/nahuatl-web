// Script para obtener usuarios de la base de datos
const { supabase } = require('./src/config/database');

async function getUserIds() {
  try {
    console.log('📋 Obteniendo usuarios de la base de datos...\n');
    
    const { data: usuarios, error } = await supabase
      .from('perfiles')
      .select('id, nombre_completo, email, username')
      .limit(5);
    
    if (error) {
      console.error('❌ Error al obtener usuarios:', error);
      return;
    }
    
    console.log('👥 Usuarios encontrados:');
    usuarios.forEach((usuario, index) => {
      console.log(`${index + 1}. ID: ${usuario.id}`);
      console.log(`   Nombre: ${usuario.nombre_completo}`);
      console.log(`   Email: ${usuario.email}`);
      console.log(`   Username: ${usuario.username || 'N/A'}`);
      console.log('');
    });
    
    if (usuarios.length > 0) {
      console.log(`🎯 Usando el primer usuario para la prueba: ${usuarios[0].id}`);
      return usuarios[0].id;
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

getUserIds().then(userId => {
  if (userId) {
    console.log(`\n✅ UserID para pruebas: ${userId}`);
  }
});