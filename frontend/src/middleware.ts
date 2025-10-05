import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_COOKIE_NAME = 'auth_session';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Lista de rutas protegidas que requieren autenticación
  const protectedPaths = [
    '/dashboard',
    '/profile',
    '/feedback',
    '/contribuir',
    '/admin',
    '/experiencia-social'
  ];

  // Verificar si la ruta actual es protegida
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

  if (isProtectedPath) {
    // Verificar si hay cookie de autenticación
    const authCookie = request.cookies.get(AUTH_COOKIE_NAME);
    
    if (!authCookie || !authCookie.value) {
      console.log(`🔒 Acceso denegado a ${pathname} - No hay cookie de autenticación`);
      
      // Redirigir al login con la URL de retorno
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('reason', 'auth_required');
      
      return NextResponse.redirect(loginUrl);
    }

    // Verificar que la cookie tenga datos válidos
    try {
      const cookieData = JSON.parse(authCookie.value);
      
      if (!cookieData.userId || !cookieData.token) {
        console.log(`🔒 Acceso denegado a ${pathname} - Cookie inválida`);
        
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        loginUrl.searchParams.set('reason', 'invalid_session');
        
        return NextResponse.redirect(loginUrl);
      }

      // Verificar que la cookie no sea muy antigua (opcional, por seguridad)
      const cookieAge = Date.now() - (cookieData.timestamp || 0);
      const MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 días en milisegundos
      
      if (cookieAge > MAX_AGE) {
        console.log(`🔒 Acceso denegado a ${pathname} - Sesión expirada`);
        
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        loginUrl.searchParams.set('reason', 'session_expired');
        
        return NextResponse.redirect(loginUrl);
      }

      console.log(`✅ Acceso permitido a ${pathname} para usuario ${cookieData.userId}`);
      
    } catch (error) {
      console.error('Error parsing auth cookie:', error);
      
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('reason', 'invalid_session');
      
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/feedback/:path*',
    '/contribuir/:path*',
    '/admin/:path*',
    '/experiencia-social/:path*'
  ],
}; 