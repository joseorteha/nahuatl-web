import { supabase } from './supabaseClient';

export interface ContributionStats {
  totalWords: number;
  totalContributors: number;
  userContributions: number;
  pendingContributions?: number;
  approvedContributions?: number;
  publishedContributions?: number;
  rejectedContributions?: number;
}

export interface AdminStats {
  totalWords: number;
  totalContributions: number;
  pendingContributions: number;
  approvedContributions: number;
  publishedContributions: number;
  rejectedContributions: number;
  totalContributors: number;
}

/**
 * Función de prueba para verificar la conexión con Supabase
 */
export async function testSupabaseConnection() {
  try {
    console.log('🔌 Testing Supabase connection...');
    console.log('📍 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('🔑 Anon Key present:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    // Test 1: Auth status
    const { data: session, error: authError } = await supabase.auth.getSession();
    console.log('🔐 Auth session:', session?.session ? 'Active' : 'Anonymous');
    if (authError) console.error('Auth error:', authError);
    
    // Test 2: Basic table access with raw response
    console.log('🧪 Testing diccionario with raw response...');
    const response = await supabase
      .from('diccionario')
      .select('*', { count: 'exact', head: true });
    
    console.log('📊 Raw response:', {
      data: response.data,
      error: response.error,
      count: response.count,
      status: response.status,
      statusText: response.statusText
    });
    
    if (response.error) {
      console.error('❌ Detailed error:', JSON.stringify(response.error, null, 2));
      console.error('❌ Error message:', response.error.message);
      console.error('❌ Error code:', response.error.code);
      console.error('❌ Error details:', response.error.details);
      console.error('❌ Error hint:', response.error.hint);
      return false;
    }
    
    console.log('✅ Supabase connection successful, diccionario has', response.count, 'records');
    return true;
  } catch (error) {
    console.error('💥 Supabase connection failed:', error);
    return false;
  }
}

/**
 * Función de prueba super simple para verificar conectividad
 */
export async function testSimpleConnection() {
  try {
    console.log('� PRUEBA SIMPLE: Intentando conexión básica...');
    
    // Prueba 1: ¿Supabase está inicializado?
    console.log('📦 Supabase client:', typeof supabase);
    console.log('🌐 URL from env:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('🔑 Key present:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    // Prueba 2: Intentar la consulta más simple posible
    console.log('🎯 Intentando SELECT simple...');
    const result = await supabase.rpc('get_current_timestamp');
    console.log('🕒 Timestamp result:', result);
    
    // Prueba 3: Intentar acceso directo a tabla
    console.log('📋 Intentando acceso directo a tabla...');
    const tableResult = await supabase.from('diccionario').select('count');
    console.log('📊 Table result:', {
      data: tableResult.data,
      error: tableResult.error ? {
        message: tableResult.error.message,
        code: tableResult.error.code,
        details: tableResult.error.details
      } : null,
      count: tableResult.count
    });
    
    return tableResult.error ? false : true;
    
  } catch (error) {
    console.error('💥 Simple connection failed:', error);
    return false;
  }
}

/**
 * Obtiene estadísticas generales de contribuciones
 */
export async function getContributionStats(userId?: string): Promise<ContributionStats> {
  try {
    console.log('� Fetching contribution stats...');
    
    // Obtener total de palabras
    const { count: totalWords } = await supabase
      .from('diccionario')
      .select('*', { count: 'exact', head: true });

    // Obtener contribuyentes únicos
    const { data: contributorsData } = await supabase
      .from('contribuciones_diccionario')
      .select('usuario_id')
      .neq('usuario_id', null);

    const uniqueContributors = new Set(contributorsData?.map(c => c.usuario_id) || []);
    const totalContributors = uniqueContributors.size;

    // Obtener contribuciones del usuario
    let userContributions = 0;
    if (userId) {
      const { count } = await supabase
        .from('contribuciones_diccionario')
        .select('*', { count: 'exact', head: true })
        .eq('usuario_id', userId);
      
      userContributions = count || 0;
    }

    const result = {
      totalWords: totalWords || 0,
      totalContributors,
      userContributions
    };

    console.log('📊 Final stats result:', result);
    return result;

  } catch (error) {
    console.error('💥 Error fetching contribution stats:', error);
    // Retornar valores por defecto en caso de error
    return {
      totalWords: 0,
      totalContributors: 0,
      userContributions: 0
    };
  }
}

/**
 * Obtiene estadísticas adicionales para el panel de admin
 */
export async function getAdminStats() {
  try {
    console.log('📊 Getting admin stats...');
    
    // Contribuciones pendientes
    const { count: pendingContributions } = await supabase
      .from('contribuciones_diccionario')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'pendiente');

    // Contribuciones del último mes
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const { count: recentContributions } = await supabase
      .from('contribuciones_diccionario')
      .select('*', { count: 'exact', head: true })
      .gte('fecha_creacion', lastMonth.toISOString());

    // Palabras aprobadas este mes
    const { count: approvedThisMonth } = await supabase
      .from('contribuciones_diccionario')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'aprobada')
      .gte('fecha_revision', lastMonth.toISOString());

    const result = {
      pendingContributions: pendingContributions || 0,
      recentContributions: recentContributions || 0,
      approvedThisMonth: approvedThisMonth || 0
    };

    console.log('✅ Admin stats loaded:', result);
    return result;

  } catch (error) {
    console.error('❌ Error fetching admin stats:', error);
    return {
      pendingContributions: 0,
      recentContributions: 0,
      approvedThisMonth: 0
    };
  }
}

/**
 * Obtiene estadísticas completas para dashboards más avanzados
 */
export async function getFullAdminStats(): Promise<AdminStats> {
  try {
    console.log('📊 Getting full admin stats...');
    
    // Intentar usar la función SQL personalizada primero
    try {
      const { data, error } = await supabase.rpc('obtener_estadisticas_contribuciones');
      
      if (!error && data && data.length > 0) {
        const result = data[0];
        return {
          totalWords: result.total_palabras_diccionario || 0,
          totalContributions: result.total_contribuciones || 0,
          pendingContributions: result.contribuciones_pendientes || 0,
          approvedContributions: result.contribuciones_aprobadas || 0,
          publishedContributions: result.contribuciones_publicadas || 0,
          rejectedContributions: result.contribuciones_rechazadas || 0,
          totalContributors: result.total_contribuidores || 0
        };
      }
    } catch (rpcError) {
      console.log('RPC function not available, using manual queries');
    }

    // Fallback a consultas manuales si la función RPC no está disponible
    const { count: totalWords } = await supabase
      .from('diccionario')
      .select('*', { count: 'exact', head: true });

    const { count: totalContributions } = await supabase
      .from('contribuciones_diccionario')
      .select('*', { count: 'exact', head: true });

    // Contribuciones por estado
    const { count: pendingContributions } = await supabase
      .from('contribuciones_diccionario')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'pendiente');

    const { count: approvedContributions } = await supabase
      .from('contribuciones_diccionario')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'aprobada');

    const { count: publishedContributions } = await supabase
      .from('contribuciones_diccionario')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'publicada');

    const { count: rejectedContributions } = await supabase
      .from('contribuciones_diccionario')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'rechazada');

    // Contribuidores únicos
    const { data: contributorsData } = await supabase
      .from('contribuciones_diccionario')
      .select('usuario_id')
      .neq('usuario_id', null);

    const uniqueContributors = new Set(contributorsData?.map(c => c.usuario_id) || []);

    return {
      totalWords: totalWords || 0,
      totalContributions: totalContributions || 0,
      pendingContributions: pendingContributions || 0,
      approvedContributions: approvedContributions || 0,
      publishedContributions: publishedContributions || 0,
      rejectedContributions: rejectedContributions || 0,
      totalContributors: uniqueContributors.size
    };

  } catch (error) {
    console.error('❌ Error in getFullAdminStats:', error);
    return {
      totalWords: 0,
      totalContributions: 0,
      pendingContributions: 0,
      approvedContributions: 0,
      publishedContributions: 0,
      rejectedContributions: 0,
      totalContributors: 0
    };
  }
}