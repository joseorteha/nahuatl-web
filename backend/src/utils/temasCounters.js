const { supabase } = require('../config/database');

/**
 * Actualiza los contadores de un tema específico
 * @param {string} temaId - ID del tema a actualizar
 */
async function updateTemaCounters(temaId) {
  try {
    console.log(`🔄 Actualizando contadores para tema: ${temaId}`);
    
    // 1. Contar likes reales
    const { data: likes, error: likesError } = await supabase
      .from('temas_likes')
      .select('id')
      .eq('tema_id', temaId);
      
    if (likesError) {
      console.error('❌ Error obteniendo likes:', likesError);
      return false;
    }
    
    const likesCount = likes?.length || 0;
    
    // 2. Contar shares reales
    const { data: shares, error: sharesError } = await supabase
      .from('temas_shares')
      .select('id')
      .eq('tema_id', temaId);
      
    if (sharesError) {
      console.error('❌ Error obteniendo shares:', sharesError);
      return false;
    }
    
    const sharesCount = shares?.length || 0;
    
    // 3. Contar respuestas reales
    const { data: respuestas, error: respuestasError } = await supabase
      .from('temas_conversacion')
      .select('id')
      .eq('tema_padre_id', temaId)
      .eq('es_respuesta', true);
      
    if (respuestasError) {
      console.error('❌ Error obteniendo respuestas:', respuestasError);
      return false;
    }
    
    const respuestasCount = respuestas?.length || 0;
    
    // 4. Calcular participantes únicos
    const participantesUnicos = new Set();
    
    // Agregar creador
    const { data: temaCompleto, error: temaCompletoError } = await supabase
      .from('temas_conversacion')
      .select('creador_id')
      .eq('id', temaId)
      .single();
      
    if (temaCompletoError) {
      console.error('❌ Error obteniendo creador:', temaCompletoError);
      return false;
    }
    
    participantesUnicos.add(temaCompleto.creador_id);
    
    // Agregar usuarios que dieron like
    if (likes && likes.length > 0) {
      const { data: likesUsuarios, error: likesUsuariosError } = await supabase
        .from('temas_likes')
        .select('usuario_id')
        .eq('tema_id', temaId);
        
      if (!likesUsuariosError && likesUsuarios) {
        likesUsuarios.forEach(l => participantesUnicos.add(l.usuario_id));
      }
    }
    
    // Agregar usuarios que compartieron
    if (shares && shares.length > 0) {
      const { data: sharesUsuarios, error: sharesUsuariosError } = await supabase
        .from('temas_shares')
        .select('usuario_id')
        .eq('tema_id', temaId);
        
      if (!sharesUsuariosError && sharesUsuarios) {
        sharesUsuarios.forEach(s => participantesUnicos.add(s.usuario_id));
      }
    }
    
    // Agregar usuarios que respondieron
    if (respuestas && respuestas.length > 0) {
      const { data: respuestasUsuarios, error: respuestasUsuariosError } = await supabase
        .from('temas_conversacion')
        .select('creador_id')
        .eq('tema_padre_id', temaId)
        .eq('es_respuesta', true);
        
      if (!respuestasUsuariosError && respuestasUsuarios) {
        respuestasUsuarios.forEach(r => participantesUnicos.add(r.creador_id));
      }
    }
    
    const participantesCount = participantesUnicos.size;
    
    // 5. Actualizar contadores en la BD
    const { error: updateError } = await supabase
      .from('temas_conversacion')
      .update({
        contador_likes: likesCount,
        compartido_contador: sharesCount,
        respuestas_count: respuestasCount,
        participantes_count: participantesCount,
        ultima_actividad: new Date().toISOString()
      })
      .eq('id', temaId);
      
    if (updateError) {
      console.error('❌ Error actualizando contadores:', updateError);
      return false;
    }
    
    console.log(`✅ Contadores actualizados para tema ${temaId}:`);
    console.log(`  - Likes: ${likesCount}`);
    console.log(`  - Shares: ${sharesCount}`);
    console.log(`  - Respuestas: ${respuestasCount}`);
    console.log(`  - Participantes: ${participantesCount}`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Error general actualizando contadores:', error);
    return false;
  }
}

/**
 * Actualiza todos los contadores de temas
 */
async function updateAllTemasCounters() {
  try {
    console.log('🔄 ACTUALIZANDO TODOS LOS CONTADORES DE TEMAS...\n');
    
    // Obtener todos los temas principales
    const { data: temas, error: temasError } = await supabase
      .from('temas_conversacion')
      .select('id, titulo')
      .eq('es_tema_principal', true);
      
    if (temasError) {
      console.error('❌ Error obteniendo temas:', temasError);
      return false;
    }
    
    console.log(`📋 Procesando ${temas.length} temas...`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const tema of temas) {
      const success = await updateTemaCounters(tema.id);
      if (success) {
        successCount++;
      } else {
        errorCount++;
      }
    }
    
    console.log(`\n🎉 Actualización completada:`);
    console.log(`  ✅ Exitosos: ${successCount}`);
    console.log(`  ❌ Errores: ${errorCount}`);
    
    return successCount > 0;
    
  } catch (error) {
    console.error('❌ Error general:', error);
    return false;
  }
}

module.exports = {
  updateTemaCounters,
  updateAllTemasCounters
};
