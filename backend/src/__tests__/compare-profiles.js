// Script para comparar datos entre perfil principal y perfil específico
const axios = require('axios');

const API_URL = 'http://localhost:3001';

async function compareProfileData() {
  try {
    console.log('🔍 COMPARANDO DATOS DE PERFILES');
    console.log('====================================\n');
    
    const testUserId = 'af465694-6132-4c05-a58b-c974c0fcf005'; // Sara Ortega
    
    // 1. Probar el endpoint del perfil específico (público)
    console.log('📊 1. ENDPOINT PERFIL ESPECÍFICO (público)');
    console.log(`GET /api/profile/${testUserId}`);
    console.log('------------------------------------------');
    
    try {
      const profileResponse = await axios.get(`${API_URL}/api/profile/${testUserId}`);
      console.log('✅ Status:', profileResponse.status);
      console.log('📋 Datos del perfil específico:');
      console.log('- Nombre:', profileResponse.data.data.nombre_completo);
      console.log('- Email:', profileResponse.data.data.email);
      console.log('- Username:', profileResponse.data.data.username);
      console.log('- Puntos Conocimiento:', profileResponse.data.data.puntos_conocimiento);
      console.log('- Experiencia Social:', profileResponse.data.data.experiencia_social);
      console.log('- Nivel Conocimiento:', profileResponse.data.data.nivel_conocimiento);
      console.log('- Nivel Social:', profileResponse.data.data.nivel_social);
      console.log('- Temas Creados:', profileResponse.data.data.estadisticas.temas_creados);
      console.log('- Respuestas Creadas:', profileResponse.data.data.estadisticas.respuestas_creadas);
      console.log('- Likes Dados:', profileResponse.data.data.estadisticas.likes_dados);
      console.log('- Likes Recibidos:', profileResponse.data.data.estadisticas.likes_recibidos);
      console.log('- Shares Dados:', profileResponse.data.data.estadisticas.shares_dados);
      console.log('- Shares Recibidos:', profileResponse.data.data.estadisticas.shares_recibidos);
      console.log('- Logros Recientes:', profileResponse.data.data.logros_recientes.length);
      console.log('- Temas Recientes:', profileResponse.data.data.temas_recientes.length);
    } catch (error) {
      console.error('❌ Error en perfil específico:', error.response?.data || error.message);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 2. Intentar probar endpoints del perfil principal (requieren autenticación)
    console.log('📊 2. ENDPOINTS PERFIL PRINCIPAL (requieren autenticación)');
    console.log('----------------------------------------------------------');
    
    const endpoints = [
      `/api/auth/stats/${testUserId}`,
      `/api/contribuciones/stats/${testUserId}`,
      `/api/recompensas/usuario/${testUserId}`,
      `/api/profile/conocimiento/${testUserId}`,
      `/api/profile/comunidad/${testUserId}`,
      `/api/profile/resumen/${testUserId}`
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`\n🔍 Probando: ${endpoint}`);
        const response = await axios.get(`${API_URL}${endpoint}`);
        console.log('✅ Status:', response.status);
        console.log('📋 Keys disponibles:', Object.keys(response.data));
      } catch (error) {
        console.log('❌ Error:', error.response?.status, '-', error.response?.data?.error || error.message);
      }
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 3. Análisis de diferencias
    console.log('📈 3. ANÁLISIS DE DIFERENCIAS');
    console.log('-----------------------------');
    console.log('• El perfil específico (/api/profile/:userId) es PÚBLICO y no requiere autenticación');
    console.log('• Los endpoints del perfil principal requieren autenticación con Bearer token');
    console.log('• El perfil específico devuelve datos agregados y calculados en un solo endpoint');
    console.log('• El perfil principal usa múltiples endpoints especializados');
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

// Verificar servidor primero
async function checkServer() {
  try {
    const response = await axios.get(`${API_URL}/health`);
    console.log('🟢 Servidor funcionando:', response.data.status);
    return true;
  } catch (error) {
    console.log('🔴 Servidor no disponible');
    return false;
  }
}

async function main() {
  const serverOk = await checkServer();
  if (serverOk) {
    await compareProfileData();
  }
}

main();