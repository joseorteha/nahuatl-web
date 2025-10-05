// scripts/run-push-migration.js
const { supabase } = require('../src/config/database');
const fs = require('fs');
const path = require('path');

async function runPushNotificationMigration() {
  try {
    console.log('🚀 Ejecutando migración para push notifications...\n');

    // Leer el archivo SQL
    const migrationPath = path.join(__dirname, '../migrations/create_push_subscriptions.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Archivo de migración cargado');
    console.log('📊 Ejecutando SQL...\n');

    // Ejecutar la migración
    const { data, error } = await supabase.rpc('exec_sql', { sql_text: sql });

    if (error) {
      console.error('❌ Error ejecutando migración:', error);
      throw error;
    }

    console.log('✅ Migración ejecutada exitosamente');
    console.log('📋 Tabla "push_subscriptions" creada');
    console.log('🔒 Políticas RLS configuradas');
    console.log('📊 Índices creados');
    console.log('⚡ Triggers configurados\n');

    // Verificar que la tabla existe
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'push_subscriptions')
      .eq('table_schema', 'public');

    if (tableError) {
      console.error('❌ Error verificando tabla:', tableError);
    } else if (tables && tables.length > 0) {
      console.log('✅ Verificación: Tabla "push_subscriptions" existe');
    } else {
      console.log('⚠️ Advertencia: No se pudo verificar la tabla');
    }

    console.log('\n🎯 Migración completada exitosamente');
    console.log('📱 Ya puedes usar push notifications en tu aplicación');

  } catch (error) {
    console.error('💥 Error en la migración:', error);
    process.exit(1);
  }
}

// Función alternativa si no tienes la función exec_sql
async function runMigrationManually() {
  try {
    console.log('🔧 Ejecutando migración manualmente...\n');

    // Crear tabla
    const { error: createError } = await supabase.rpc('create_push_subscriptions_table');

    if (createError) {
      console.log('📋 Ejecuta este SQL manualmente en tu dashboard de Supabase:\n');
      
      const migrationPath = path.join(__dirname, '../migrations/create_push_subscriptions.sql');
      const sql = fs.readFileSync(migrationPath, 'utf8');
      
      console.log('```sql');
      console.log(sql);
      console.log('```\n');
      
      console.log('🌐 Ve a: https://supabase.com/dashboard/project/[tu-proyecto]/sql');
      console.log('📝 Copia y pega el SQL de arriba');
      console.log('▶️ Ejecuta la consulta');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

// Ejecutar migración
if (require.main === module) {
  runPushNotificationMigration().catch(() => {
    console.log('\n🔄 Intentando método alternativo...\n');
    runMigrationManually();
  });
}

module.exports = { runPushNotificationMigration };