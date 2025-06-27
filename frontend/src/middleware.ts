import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Rutas que requieren autenticación
  const protectedRoutes = ['/dashboard', '/diccionario', '/lecciones', '/practica', '/feedback'];
  
  // Verificar si la ruta actual requiere autenticación
  // const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  // Por ahora, permitimos acceso a todas las rutas
  // La autenticación se manejará en el lado del cliente
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/diccionario/:path*',
    '/lecciones/:path*',
    '/practica/:path*',
    '/feedback/:path*',
  ],
}; 