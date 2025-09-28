const { supabase } = require('./config/database');
const fs = require('fs');

async function runCompleteMigrations() {
  try {
    console.log('🔄 Ejecutando migraciones completas...');
    
    // 1. Agregar columnas a temas_conversacion
    console.log('📝 Agregando columnas a temas_conversacion...');
    const addColumnsSQL = fs.readFileSync('./migrations/add_temas_columns.sql', 'utf8');
    const commands1 = addColumnsSQL.split(';').filter(cmd => cmd.trim());
    
    for (const command of commands1) {
      if (command.trim()) {
        console.log(`📝 Ejecutando: ${command.trim().substring(0, 50)}...`);
        // Simular ejecución - en producción usarías supabase.rpc('exec_sql', { sql: command })
        console.log('✅ Comando ejecutado (simulado)');
      }
    }
    
    // 2. Crear tabla temas_likes
    console.log('📝 Creando tabla temas_likes...');
    const createLikesSQL = fs.readFileSync('./migrations/create_temas_likes_complete.sql', 'utf8');
    const commands2 = createLikesSQL.split(';').filter(cmd => cmd.trim());
    
    for (const command of commands2) {
      if (command.trim()) {
        console.log(`📝 Ejecutando: ${command.trim().substring(0, 50)}...`);
        console.log('✅ Comando ejecutado (simulado)');
      }
    }
    
    // 3. Crear tabla temas_shares
    console.log('📝 Creando tabla temas_shares...');
    const createSharesSQL = fs.readFileSync('./migrations/create_temas_shares.sql', 'utf8');
    const commands3 = createSharesSQL.split(';').filter(cmd => cmd.trim());
    
    for (const command of commands3) {
      if (command.trim()) {
        console.log(`📝 Ejecutando: ${command.trim().substring(0, 50)}...`);
        console.log('✅ Comando ejecutado (simulado)');
      }
    }
    
    console.log('✅ Migraciones completadas');
    console.log('📋 Para ejecutar en Supabase, copia y pega estos SQLs:');
    console.log('\n=== SQL 1: Agregar columnas ===');
    console.log(addColumnsSQL);
    console.log('\n=== SQL 2: Crear temas_likes ===');
    console.log(createLikesSQL);
    console.log('\n=== SQL 3: Crear temas_shares ===');
    console.log(createSharesSQL);
    
  } catch (error) {
    console.error('❌ Error en migraciones:', error);
  }
}

runCompleteMigrations();
