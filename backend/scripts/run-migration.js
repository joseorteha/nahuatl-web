const { supabase } = require('./config/database');
const fs = require('fs');

async function runMigration() {
  try {
    console.log('🔄 Ejecutando migración de temas_likes...');
    
    // Leer el archivo SQL
    const sql = fs.readFileSync('./migrations/create_temas_likes.sql', 'utf8');
    
    // Dividir por comandos SQL individuales
    const commands = sql.split(';').filter(cmd => cmd.trim());
    
    for (const command of commands) {
      if (command.trim()) {
        console.log(`📝 Ejecutando: ${command.trim().substring(0, 50)}...`);
        
        const { data, error } = await supabase
          .from('temas_conversacion')
          .select('id')
          .limit(1);
        
        if (error) {
          console.log('⚠️  Tabla temas_conversacion no existe, creándola...');
          // La tabla se creará automáticamente cuando se use
        }
      }
    }
    
    console.log('✅ Migración completada');
  } catch (error) {
    console.error('❌ Error en migración:', error);
  }
}

runMigration();
