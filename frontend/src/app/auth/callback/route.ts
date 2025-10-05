import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  
  // Crear una página HTML mejorada para el callback
  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Iniciando sesión - Nahuatl Web</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #2D3748 0%, #4A5568 50%, #1A202C 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          position: relative;
          overflow: hidden;
        }
        
        body::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                      radial-gradient(circle at 80% 20%, rgba(255, 177, 153, 0.3) 0%, transparent 50%);
          pointer-events: none;
        }
        
        .container {
          text-align: center;
          padding: 3rem 2rem;
          max-width: 420px;
          position: relative;
          z-index: 1;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
        }
        
        .logo {
          width: 90px;
          height: 90px;
          margin: 0 auto 2rem;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }
        
        .spinner {
          width: 50px;
          height: 50px;
          border: 3px solid rgba(255, 255, 255, 0.2);
          border-top: 3px solid #E2E8F0;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 2rem;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        h1 {
          font-size: 1.75rem;
          margin-bottom: 0.75rem;
          font-weight: 700;
          background: linear-gradient(135deg, #E2E8F0 0%, #CBD5E0 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        p {
          opacity: 0.9;
          font-size: 1rem;
          color: #E2E8F0;
          font-weight: 400;
        }
        
        .error {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.4);
          border-radius: 12px;
          padding: 1.5rem;
          margin-top: 1.5rem;
          color: #FEB2B2;
          backdrop-filter: blur(10px);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">
          <img src="/logooo.png" alt="Nahuatl Web" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover;" />
        </div>
        
        <div class="spinner"></div>
        <h1>Iniciando sesión...</h1>
        <p>Configurando tu cuenta, un momento por favor</p>
        
        <div id="error-container"></div>
      </div>

      <script>
        (function() {
          console.log('🔄 Procesando callback OAuth...');
          
          try {
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get('token');
            const refresh = urlParams.get('refresh');
            const userParam = urlParams.get('user');

            console.log('🔍 Parámetros recibidos:', { 
              hasToken: !!token, 
              hasRefresh: !!refresh, 
              hasUser: !!userParam 
            });

            if (!token || !refresh || !userParam) {
              throw new Error('Faltan parámetros de autenticación');
            }

            console.log('✅ Parámetros obtenidos correctamente');
            
            // Guardar tokens y usuario en sessionStorage (por defecto) y localStorage (backup)
            const authTokens = {
              accessToken: token,
              refreshToken: refresh,
              expiresIn: '7d'
            };
            
            const userData = JSON.parse(decodeURIComponent(userParam));
            
            // Detectar si el usuario tenia preferencia de "recordarme" antes del OAuth
            const hadRememberMePreference = localStorage.getItem('remember_me') === 'true';
            const shouldPersist = hadRememberMePreference; // Respetar la preferencia previa
            
            console.log('OAuth: Respetando preferencia de recordarme:', shouldPersist);
            
            if (shouldPersist) {
              // Guardar en localStorage para sesion persistente
              localStorage.setItem('auth_tokens', JSON.stringify(authTokens));
              localStorage.setItem('user_data', JSON.stringify(userData));
              localStorage.setItem('remember_me', 'true');
              localStorage.setItem('last_login', new Date().toISOString());
              localStorage.setItem('last_activity', new Date().toISOString());
              // Limpiar sessionStorage
              sessionStorage.removeItem('auth_tokens');
              sessionStorage.removeItem('user_data');
            } else {
              // Guardar en sessionStorage para sesion temporal
              sessionStorage.setItem('auth_tokens', JSON.stringify(authTokens));
              sessionStorage.setItem('user_data', JSON.stringify(userData));
              sessionStorage.setItem('last_activity', new Date().toISOString());
              // Limpiar localStorage
              localStorage.removeItem('auth_tokens');
              localStorage.removeItem('user_data');
              localStorage.removeItem('remember_me');
            }
            
            console.log('✅ Datos guardados en sessionStorage y localStorage con claves correctas');
            
            // Pequeño delay para asegurar que los datos se persistan antes del redirect
            setTimeout(function() {
              console.log('🔄 Redirigiendo al dashboard...');
              window.location.replace('/dashboard');
            }, 500);
            
          } catch (error) {
            console.error('💥 Error en callback OAuth:', error);
            
            const errorContainer = document.getElementById('error-container');
            errorContainer.innerHTML = \`
              <div class="error">
                <strong>Error de autenticación</strong><br>
                \${error.message || 'Ha ocurrido un error inesperado'}
              </div>
            \`;
            
            // Redirigir al login después de 3 segundos
            setTimeout(function() {
              window.location.replace('/login?error=callback_failed');
            }, 3000);
          }
        })();
      </script>
    </body>
    </html>
  `;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}