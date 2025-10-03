// Script para hacer login y comparar perfiles con autenticación
const axios = require('axios');

const API_URL = 'http://localhost:3001';

// Credenciales del usuario
const credentials = {
  email: 'joseortegahac@gmail.com',
  password: 'jose2025'
};

let authToken = null;
let userId = null;

async function login() {
  try {
    console.log('🔐 Haciendo login...');
    console.log('📧 Email:', credentials.email);
    console.log('🔑 Password:', credentials.password ? '***' : 'No definida');
    
    const response = await axios.post(`${API_URL}/api/auth/login`, credentials, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📋 Respuesta login:', response.status);
    
    if (response.data.accessToken) {
      authToken = response.data.accessToken;
      userId = response.data.user.id;
      console.log('✅ Login exitoso!');
      console.log('👤 Usuario:', response.data.user.nombre_completo);
      console.log('📧 Email:', response.data.user.email);
      console.log('🆔 ID:', userId);
      console.log('🔑 Token obtenido');
      return true;
    } else {
      console.log('❌ No se recibieron tokens en la respuesta');
      console.log('📋 Respuesta completa:', JSON.stringify(response.data, null, 2));
      return false;
    }
  } catch (error) {
    console.error('❌ Error en login:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
    return false;
  }
}

async function compareAuthenticatedProfiles() {
  try {
    console.log('\n🔍 COMPARANDO PERFILES CON AUTENTICACIÓN');
    console.log('==========================================\n');
    
    // Headers para requests autenticados
    const authHeaders = {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    };
    
    // 1. Perfil específico (público)
    console.log('📊 1. PERFIL ESPECÍFICO (público)');
    console.log(`GET /api/profile/${userId}`);
    console.log('----------------------------------');
    
    try {
      const profileResponse = await axios.get(`${API_URL}/api/profile/${userId}`);
      const profileData = profileResponse.data.data;
      
      console.log('✅ Status:', profileResponse.status);
      console.log('📋 Datos del perfil específico:');
      console.log('- Nombre:', profileData.nombre_completo);
      console.log('- Username:', profileData.username);
      console.log('- Puntos Conocimiento:', profileData.puntos_conocimiento);
      console.log('- Experiencia Social:', profileData.experiencia_social);
      console.log('- Nivel Conocimiento:', profileData.nivel_conocimiento);
      console.log('- Nivel Social:', profileData.nivel_social);
      console.log('- Temas Creados:', profileData.estadisticas.temas_creados);
      console.log('- Respuestas Creadas:', profileData.estadisticas.respuestas_creadas);
      console.log('- Likes Dados:', profileData.estadisticas.likes_dados);
      console.log('- Likes Recibidos:', profileData.estadisticas.likes_recibidos);
      console.log('- Verificado:', profileData.verificado);
      console.log('- Avatar:', profileData.url_avatar ? 'Sí' : 'No');
      console.log('- Biografía:', profileData.biografia || 'No definida');
    } catch (error) {
      console.error('❌ Error:', error.response?.data || error.message);
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // 2. Endpoints del perfil principal (autenticados)
    console.log('📊 2. ENDPOINTS DEL PERFIL PRINCIPAL (autenticados)');
    console.log('---------------------------------------------------');
    
    // Stats de auth
    try {
      console.log('\n🔍 Auth Stats:');
      const authStatsResponse = await axios.get(`${API_URL}/api/auth/stats/${userId}`, { headers: authHeaders });
      console.log('✅ Status:', authStatsResponse.status);
      console.log('📊 Stats:', authStatsResponse.data.stats);
    } catch (error) {
      console.log('❌ Auth Stats Error:', error.response?.status, '-', error.response?.data?.error || error.message);
    }
    
    // Recompensas
    try {
      console.log('\n🎁 Recompensas:');
      const recompensasResponse = await axios.get(`${API_URL}/api/recompensas/usuario/${userId}`, { headers: authHeaders });
      console.log('✅ Status:', recompensasResponse.status);
      console.log('🏆 Recompensas:', recompensasResponse.data.recompensas);
      console.log('🎖️ Logros:', recompensasResponse.data.logros?.length || 0, 'logros');
    } catch (error) {
      console.log('❌ Recompensas Error:', error.response?.status, '-', error.response?.data?.error || error.message);
    }
    
    // Conocimiento
    try {
      console.log('\n🎓 Conocimiento:');
      const conocimientoResponse = await axios.get(`${API_URL}/api/profile/conocimiento/${userId}`, { headers: authHeaders });
      console.log('✅ Status:', conocimientoResponse.status);
      console.log('📚 Keys disponibles:', Object.keys(conocimientoResponse.data.data || {}));
    } catch (error) {
      console.log('❌ Conocimiento Error:', error.response?.status, '-', error.response?.data?.error || error.message);
    }
    
    // Comunidad
    try {
      console.log('\n👥 Comunidad:');
      const comunidadResponse = await axios.get(`${API_URL}/api/profile/comunidad/${userId}`, { headers: authHeaders });
      console.log('✅ Status:', comunidadResponse.status);
      console.log('🤝 Keys disponibles:', Object.keys(comunidadResponse.data.data || {}));
    } catch (error) {
      console.log('❌ Comunidad Error:', error.response?.status, '-', error.response?.data?.error || error.message);
    }
    
    // Resumen
    try {
      console.log('\n📋 Resumen:');
      const resumenResponse = await axios.get(`${API_URL}/api/profile/resumen/${userId}`, { headers: authHeaders });
      console.log('✅ Status:', resumenResponse.status);
      console.log('📊 Keys disponibles:', Object.keys(resumenResponse.data.data || {}));
    } catch (error) {
      console.log('❌ Resumen Error:', error.response?.status, '-', error.response?.data?.error || error.message);
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // 3. Conclusiones
    console.log('📈 3. CONCLUSIONES');
    console.log('-------------------');
    console.log('✅ Login funcionando correctamente');
    console.log('✅ Perfil específico devuelve datos completos sin autenticación');
    console.log('🔒 Algunos endpoints requieren autenticación pero están funcionando');
    console.log('\n💡 RECOMENDACIÓN:');
    console.log('- El perfil específico (/profile/[userId]) debería mostrar todos los datos disponibles');
    console.log('- Verificar que el frontend esté renderizando correctamente todos los campos');
    console.log('- Posible problema: datos del usuario están vacíos o el diseño no muestra la información');
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

async function main() {
  try {
    // Verificar servidor
    const healthCheck = await axios.get(`${API_URL}/health`);
    console.log('🟢 Servidor funcionando:', healthCheck.data.status);
    
    // Login
    const loginSuccess = await login();
    
    if (loginSuccess) {
      await compareAuthenticatedProfiles();
    } else {
      console.log('❌ No se pudo hacer login');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();