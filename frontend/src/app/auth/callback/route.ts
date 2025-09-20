import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('🟢 CALLBACK ROUTE EJECUTÁNDOSE - INICIO');
  console.log('🔗 URL completa:', request.url);
  
  const requestUrl = new URL(request.url);
  
  // Verificar si es callback de nuestro backend OAuth
  const token = requestUrl.searchParams.get('token');
  const refresh = requestUrl.searchParams.get('refresh');
  const user = requestUrl.searchParams.get('user');
  const error = requestUrl.searchParams.get('error');
  const details = requestUrl.searchParams.get('details');

  if (token && refresh && user) {
    // Es callback de nuestro backend OAuth
    console.log('✅ Callback de backend OAuth detectado');
    
    try {
      // Crear página HTML que maneje el callback
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Procesando autenticación...</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              margin: 0; padding: 0; height: 100vh; display: flex; align-items: center; justify-content: center;
            }
            .container { 
              background: white; border-radius: 16px; padding: 2rem; text-align: center; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
              max-width: 400px; width: 90%;
            }
            .spinner { 
              width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #667eea; 
              border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem;
            }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            .success { color: #10b981; }
            .error { color: #ef4444; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="spinner"></div>
            <h2>Procesando autenticación...</h2>
            <p>Redirigiendo al dashboard...</p>
          </div>
          <script>
            try {
              // Guardar tokens y usuario en localStorage
              const authTokens = {
                accessToken: '${token}',
                refreshToken: '${refresh}',
                expiresIn: '7d'
              };
              
              const userData = JSON.parse(decodeURIComponent('${user}'));
              
              localStorage.setItem('auth_tokens', JSON.stringify(authTokens));
              localStorage.setItem('user', JSON.stringify(userData));
              
              // Redirigir al dashboard
              setTimeout(() => {
                window.location.href = '/dashboard';
              }, 1000);
            } catch (error) {
              console.error('Error procesando callback:', error);
              document.querySelector('.container').innerHTML = 
                '<div class="error"><h2>Error</h2><p>Error procesando la autenticación</p></div>';
              setTimeout(() => {
                window.location.href = '/login';
              }, 3000);
            }
          </script>
        </body>
        </html>
      `;
      
      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html',
        },
      });
    } catch (error) {
      console.error('Error en callback de backend OAuth:', error);
      return NextResponse.redirect(`${requestUrl.origin}/login?error=callback_error`);
    }
  } else if (error) {
    // Es un error de OAuth
    console.log('❌ Error de OAuth detectado:', error);
    return NextResponse.redirect(`${requestUrl.origin}/login?error=${error}&details=${encodeURIComponent(details || 'Error desconocido')}`);
  } else {
    // Es callback de Supabase OAuth (código de autorización)
    console.log('🔄 Callback de Supabase OAuth detectado');
    
    // Mantener la funcionalidad original de Supabase OAuth
    const code = requestUrl.searchParams.get('code');
    
    if (code) {
      // Aquí podrías mantener la lógica original de Supabase si la necesitas
      // Por ahora, redirigir al login
      return NextResponse.redirect(`${requestUrl.origin}/login?message=oauth_legacy`);
    }
    
    // Si no hay código ni tokens, redirigir al login
    return NextResponse.redirect(`${requestUrl.origin}/login?error=no_auth_data`);
  }
}
