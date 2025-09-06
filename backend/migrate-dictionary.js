// Script para migrar dictionary.json a Supabase
// Este script lee el archivo JSON y lo sube a la tabla 'diccionario' en Supabase

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://lygfsgtwwijrkrqkvxjh.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5Z2ZzZ3R3d2lqcmtycWt2eGpoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgyODQ2MiwiZXhwIjoyMDY2NDA0NDYyfQ.dSy64XHEF50vbV6tjJ-0wev6vXles1EPvSkMjXBL1Wo';

// Crear cliente de Supabase con service key (permisos de admin)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Función para mapear campos del JSON a los nombres en español de la BD
function mapToSpanishFields(entry) {
  return {
    word: entry.word || '',
    variants: entry.variants || null,
    info_gramatical: entry.grammar_info || '',
    definition: entry.definition || '',
    nombre_cientifico: entry.scientific_name || null,
    examples: entry.examples || null,
    synonyms: entry.synonyms || null,
    roots: entry.roots || null,
    ver_tambien: entry.see_also || null,
    ortografias_alternativas: entry.alt_spellings || null,
    notes: entry.notes || null
  };
}

async function migrateDictionary() {
  try {
    console.log('🚀 Iniciando migración del diccionario...');
    
    // Leer el archivo JSON
    const dictionaryPath = path.join(__dirname, 'data', 'dictionary.json');
    const rawData = fs.readFileSync(dictionaryPath, 'utf8');
    const dictionaryData = JSON.parse(rawData);
    
    console.log(`📚 Encontradas ${dictionaryData.length} entradas en el JSON`);
    
    // Limpiar la tabla primero (opcional - comentar si no quieres limpiar)
    console.log('🧹 Limpiando tabla diccionario...');
    const { error: deleteError } = await supabase
      .from('diccionario')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Elimina todos los registros
    
    if (deleteError) {
      console.warn('⚠️ Error al limpiar tabla (puede estar vacía):', deleteError.message);
    }
    
    // Procesar en lotes de 100 para evitar límites de Supabase
    const batchSize = 100;
    let totalInserted = 0;
    let totalErrors = 0;
    
    for (let i = 0; i < dictionaryData.length; i += batchSize) {
      const batch = dictionaryData.slice(i, i + batchSize);
      const mappedBatch = batch.map(mapToSpanishFields);
      
      console.log(`📝 Procesando lote ${Math.floor(i/batchSize) + 1}/${Math.ceil(dictionaryData.length/batchSize)} (${mappedBatch.length} entradas)`);
      
      const { data, error } = await supabase
        .from('diccionario')
        .insert(mappedBatch);
      
      if (error) {
        console.error(`❌ Error en lote ${Math.floor(i/batchSize) + 1}:`, error);
        totalErrors += batch.length;
      } else {
        totalInserted += batch.length;
        console.log(`✅ Lote ${Math.floor(i/batchSize) + 1} insertado correctamente`);
      }
      
      // Pequeña pausa para no sobrecargar Supabase
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('🎉 Migración completada!');
    console.log(`✅ Total insertadas: ${totalInserted}`);
    console.log(`❌ Total errores: ${totalErrors}`);
    
    // Verificar que se insertaron los datos
    const { count, error: countError } = await supabase
      .from('diccionario')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error al contar registros:', countError);
    } else {
      console.log(`📊 Total registros en BD: ${count}`);
    }
    
  } catch (error) {
    console.error('💥 Error general:', error);
  }
}

// Ejecutar la migración
if (require.main === module) {
  migrateDictionary()
    .then(() => {
      console.log('🏁 Script terminado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { migrateDictionary };
