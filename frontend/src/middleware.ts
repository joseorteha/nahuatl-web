import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function middleware(_request: NextRequest) {
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