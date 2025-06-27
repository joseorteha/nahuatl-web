import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
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