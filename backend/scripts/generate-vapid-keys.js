// scripts/generate-vapid-keys.js
const webpush = require('web-push');

console.log('🔑 Generando VAPID keys para push notifications...\n');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('✅ VAPID keys generadas exitosamente:\n');

console.log('🔧 Agrega estas variables a tu archivo .env:\n');
console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}\n`);

console.log('📋 Para Render.com (Backend):');
console.log('1. Ve a tu proyecto en Render');
console.log('2. Ve a Environment');
console.log('3. Agrega estas dos variables\n');

console.log('📋 Para Vercel (Frontend):');
console.log('1. Ve a tu proyecto en Vercel');
console.log('2. Ve a Settings > Environment Variables');
console.log('3. Agrega solo la clave pública:');
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}\n`);

console.log('🔒 IMPORTANTE:');
console.log('- Nunca compartas la clave privada públicamente');
console.log('- La clave pública va al frontend (NEXT_PUBLIC_)');
console.log('- Ambas claves van al backend\n');

console.log('🎯 Una vez configuradas, reinicia ambos servicios.');