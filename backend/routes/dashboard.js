const express = require('express');
const router = express.Router();
const { supabase } = require('../config/database');

// GET /api/dashboard/featured-word - Obtener palabra más buscada/guardada
router.get('/featured-word', async (req, res) => {
  try {
    console.log('🔍 Obteniendo palabra destacada...');

    // Algoritmo: Palabra más guardada en las últimas 7 días (más datos)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Obtener palabras más guardadas recientemente
    const { data: palabrasGuardadas, error: palabrasError } = await supabase
      .from('palabras_guardadas')
      .select(`
        diccionario_id,
        diccionario!inner(
          id,
          word,
          definition,
          fecha_creacion
        )
      `)
      .gte('fecha_creacion', weekAgo.toISOString())
      .order('fecha_creacion', { ascending: false });

    if (palabrasError) {
      console.error('❌ Error obteniendo palabras guardadas:', palabrasError);
      throw palabrasError;
    }

    // Contar frecuencia de palabras guardadas
    const wordCounts = {};
    palabrasGuardadas?.forEach(item => {
      if (item.diccionario) {
        const word = item.diccionario.word;
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      }
    });

    // Encontrar la palabra más frecuente
    let mostFrequentWord = null;
    let maxCount = 0;
    
    Object.entries(wordCounts).forEach(([word, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostFrequentWord = word;
      }
    });

    // Si no hay datos recientes, obtener la palabra más guardada de todos los tiempos
    if (!mostFrequentWord) {
      const { data: allPalabrasGuardadas, error: allPalabrasError } = await supabase
        .from('palabras_guardadas')
        .select(`
          diccionario_id,
          diccionario!inner(
            id,
            word,
            definition
          )
        `)
        .order('fecha_creacion', { ascending: false })
        .limit(100);

      if (!allPalabrasError && allPalabrasGuardadas) {
        const allWordCounts = {};
        allPalabrasGuardadas.forEach(item => {
          if (item.diccionario) {
            const word = item.diccionario.word;
            allWordCounts[word] = (allWordCounts[word] || 0) + 1;
          }
        });

        Object.entries(allWordCounts).forEach(([word, count]) => {
          if (count > maxCount) {
            maxCount = count;
            mostFrequentWord = word;
          }
        });
      }
    }

    // Si aún no hay datos, obtener una palabra aleatoria del diccionario
    if (!mostFrequentWord) {
      const { data: randomWord, error: randomError } = await supabase
        .from('diccionario')
        .select('word, definition')
        .order('fecha_creacion', { ascending: false })
        .limit(1)
        .single();

      if (!randomError && randomWord) {
        mostFrequentWord = randomWord.word;
        maxCount = 1;
      }
    }

    // Obtener detalles de la palabra más frecuente
    let featuredWord = null;
    if (mostFrequentWord) {
      const { data: wordDetails, error: wordError } = await supabase
        .from('diccionario')
        .select('word, definition')
        .eq('word', mostFrequentWord)
        .single();

      if (!wordError && wordDetails) {
        featuredWord = {
          palabra: wordDetails.word,
          traduccion: wordDetails.definition,
          busquedas: maxCount
        };
      }
    }

    // Fallback: palabra por defecto si no hay datos
    if (!featuredWord) {
      featuredWord = {
        palabra: 'Tlazocamati',
        traduccion: 'Gracias',
        busquedas: 1
      };
    }

    console.log('✅ Palabra destacada obtenida:', featuredWord);

    res.status(200).json({
      success: true,
      data: featuredWord
    });

  } catch (error) {
    console.error('❌ Error obteniendo palabra destacada:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al obtener palabra destacada'
    });
  }
});

// GET /api/dashboard/featured-user - Obtener usuario más activo
router.get('/featured-user', async (req, res) => {
  try {
    console.log('🔍 Obteniendo usuario destacado...');

    // Algoritmo real: Obtener usuario del ranking social
    console.log('🔍 Obteniendo usuario destacado del ranking social...');

    // Primero intentar obtener del ranking social
    const { data: rankingData, error: rankingError } = await supabase
      .from('ranking_social')
      .select(`
        usuario_id,
        experiencia_social,
        perfiles!inner(
          id,
          nombre_completo,
          username,
          url_avatar
        )
      `)
      .order('experiencia_social', { ascending: false })
      .limit(1);

    console.log('📊 Datos de ranking obtenidos:', { rankingData, rankingError });

    let featuredUser = null;

    if (!rankingError && rankingData && rankingData.length > 0) {
      const topUser = rankingData[0];
      if (topUser.perfiles) {
        featuredUser = {
          id: topUser.usuario_id,
          nombre: topUser.perfiles.nombre_completo,
          username: topUser.perfiles.username || 'usuario',
          avatar: topUser.perfiles.url_avatar || '',
          actividad: topUser.experiencia_social || 0
        };
        console.log('✅ Usuario destacado del ranking:', featuredUser);
      }
    }

    // Si no hay ranking, obtener usuario con más experiencia social de recompensas
    if (!featuredUser) {
      console.log('🔍 Buscando usuario con más experiencia social...');
      
      const { data: recompensasData, error: recompensasError } = await supabase
        .from('recompensas_usuario')
        .select(`
          usuario_id,
          experiencia_social,
          perfiles!inner(
            id,
            nombre_completo,
            username,
            url_avatar
          )
        `)
        .order('experiencia_social', { ascending: false })
        .limit(1);

      console.log('📊 Datos de recompensas obtenidos:', { recompensasData, recompensasError });

      if (!recompensasError && recompensasData && recompensasData.length > 0) {
        const topUser = recompensasData[0];
        if (topUser.perfiles) {
          featuredUser = {
            id: topUser.usuario_id,
            nombre: topUser.perfiles.nombre_completo,
            username: topUser.perfiles.username || 'usuario',
            avatar: topUser.perfiles.url_avatar || '',
            actividad: topUser.experiencia_social || 0
          };
          console.log('✅ Usuario destacado de recompensas:', featuredUser);
        }
      }
    }

    // Si aún no hay datos, obtener cualquier usuario real
    if (!featuredUser) {
      console.log('🔍 Obteniendo cualquier usuario real...');
      
      const { data: users, error: usersError } = await supabase
        .from('perfiles')
        .select('id, nombre_completo, username, url_avatar')
        .limit(1);

      if (!usersError && users && users.length > 0) {
        const user = users[0];
        featuredUser = {
          id: user.id,
          nombre: user.nombre_completo,
          username: user.username || 'usuario',
          avatar: user.url_avatar || '',
          actividad: Math.floor(Math.random() * 50) + 10
        };
        console.log('✅ Usuario destacado aleatorio:', featuredUser);
      } else {
        console.log('❌ No se encontraron usuarios, usando fallback');
        featuredUser = {
          id: '1',
          nombre: 'Usuario Destacado',
          username: 'usuario_activo',
          avatar: '',
          actividad: 35
        };
      }
    }

    console.log('✅ Usuario destacado obtenido:', featuredUser);

    res.status(200).json({
      success: true,
      data: featuredUser
    });

  } catch (error) {
    console.error('❌ Error obteniendo usuario destacado:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al obtener usuario destacado'
    });
  }
});

// GET /api/dashboard/stats - Obtener estadísticas generales del dashboard
router.get('/stats', async (req, res) => {
  try {
    console.log('🔍 Obteniendo estadísticas del dashboard...');

    // Obtener estadísticas en paralelo
    const [
      totalUsers,
      totalWords,
      totalTemas,
      totalContributions
    ] = await Promise.all([
      supabase.from('perfiles').select('id', { count: 'exact', head: true }),
      supabase.from('diccionario').select('id', { count: 'exact', head: true }),
      supabase.from('temas_conversacion').select('id', { count: 'exact', head: true }),
      supabase.from('contribuciones_diccionario').select('id', { count: 'exact', head: true })
    ]);

    const stats = {
      totalUsers: totalUsers.count || 0,
      totalWords: totalWords.count || 0,
      totalTemas: totalTemas.count || 0,
      totalContributions: totalContributions.count || 0
    };

    console.log('✅ Estadísticas obtenidas:', stats);

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al obtener estadísticas'
    });
  }
});

// GET /api/dashboard/test-users - Endpoint de prueba para verificar usuarios
router.get('/test-users', async (req, res) => {
  try {
    console.log('🔍 Probando consulta de usuarios...');

    const { data: users, error: usersError } = await supabase
      .from('perfiles')
      .select('id, nombre_completo, username, url_avatar')
      .limit(3);

    console.log('📊 Resultado de prueba:', { users, usersError });

    res.status(200).json({
      success: true,
      data: { users, usersError }
    });

  } catch (error) {
    console.error('❌ Error en prueba de usuarios:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/dashboard/test-ranking - Endpoint de prueba para verificar ranking
router.get('/test-ranking', async (req, res) => {
  try {
    console.log('🔍 Probando consulta de ranking...');

    // Probar ranking_social
    const { data: rankingData, error: rankingError } = await supabase
      .from('ranking_social')
      .select(`
        usuario_id,
        experiencia_social,
        perfiles!inner(
          id,
          nombre_completo,
          username,
          url_avatar
        )
      `)
      .order('experiencia_social', { ascending: false })
      .limit(3);

    // Probar recompensas_usuario
    const { data: recompensasData, error: recompensasError } = await supabase
      .from('recompensas_usuario')
      .select(`
        usuario_id,
        experiencia_social,
        perfiles!inner(
          id,
          nombre_completo,
          username,
          url_avatar
        )
      `)
      .order('experiencia_social', { ascending: false })
      .limit(3);

    console.log('📊 Resultado de ranking:', { rankingData, rankingError });
    console.log('📊 Resultado de recompensas:', { recompensasData, recompensasError });

    res.status(200).json({
      success: true,
      data: { 
        ranking: { data: rankingData, error: rankingError },
        recompensas: { data: recompensasData, error: recompensasError }
      }
    });

  } catch (error) {
    console.error('❌ Error en prueba de ranking:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
