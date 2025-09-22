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
          <meta charset="UTF-8">
          <title>Iniciando sesión...</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: #f8fafc;
              margin: 0; padding: 0; height: 100vh; display: flex; align-items: center; justify-content: center;
            }
            .container { 
              background: white; 
              border-radius: 12px; 
              padding: 2rem; 
              text-align: center; 
              box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
              max-width: 400px; width: 90%;
              border: 1px solid #e2e8f0;
            }
            .spinner { 
              width: 32px; height: 32px; border: 3px solid #e2e8f0; border-top: 3px solid #3b82f6; 
              border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem;
            }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            .success { color: #10b981; }
            .error { color: #ef4444; }
            h2 { color: #1e293b; margin: 0 0 0.5rem 0; font-size: 1.25rem; font-weight: 600; }
            p { color: #64748b; margin: 0; font-size: 0.875rem; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="spinner"></div>
            <h2>Iniciando sesión...</h2>
            <p>Un momento, por favor</p>
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
