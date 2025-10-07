import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Lista de rutas protegidas que requieren autenticación
  const protectedPaths = [
    '/dashboard',
    '/profile', 
    '/comunidad',
    '/contribuir',
    '/admin',
    '/experiencia-social'
  ];

  // Verificar si la ruta actual es protegida
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

  if (isProtectedPath) {
    // Por ahora, permitir el acceso y dejar que el frontend maneje la autenticación
    // El contexto de auth se encargará de redirigir si no hay sesión válida
    console.log(`� Ruta protegida detectada: ${pathname} - Permitiendo acceso (frontend manejará auth)`);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/comunidad/:path*',
    '/contribuir/:path*',
    '/admin/:path*',
    '/experiencia-social/:path*'
  ],
}; 