// Test del endpoint de perfil específico
const axios = require('axios');

const API_URL = 'http://localhost:3001';

async function testProfileEndpoint() {
  try {
    console.log('🧪 Testing Profile Endpoint');
    console.log('==========================\n');
    
    // Probar con un userId específico (ID real de la base de datos)
    const testUserId = '482b2ddf-d62a-4999-bd36-54077123e106'; // Jose Ortega
    
    console.log(`📋 Probando endpoint: GET ${API_URL}/api/profile/${testUserId}`);
    
    const response = await axios.get(`${API_URL}/api/profile/${testUserId}`, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Status:', response.status);
    console.log('📊 Response data:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error testing profile endpoint:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('No response received');
    } else {
      console.error('Error:', error.message);
    }
  }
}

// También vamos a probar si el servidor está ejecutándose
async function checkServerHealth() {
  try {
    const response = await axios.get(`${API_URL}/health`);
    console.log('🟢 Server is running:', response.data);
    return true;
  } catch (error) {
    console.log('🔴 Server not running or not accessible');
    return false;
  }
}

async function main() {
  const serverRunning = await checkServerHealth();
  
  if (serverRunning) {
    await testProfileEndpoint();
  } else {
    console.log('Please start the backend server first with: npm start');
  }
}

main();