// lib/utils/cookies.ts - Utilidades para manejo de cookies de autenticación
export const AUTH_COOKIE_NAME = 'auth_session';
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 días

interface CookieOptions {
  maxAge?: number;
  path?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

/**
 * Establecer cookie de autenticación
 */
export function setAuthCookie(value: string, remember: boolean = false): void {
  if (typeof document === 'undefined') return;

  const maxAge = remember ? AUTH_COOKIE_MAX_AGE : undefined; // Sin maxAge = cookie de sesión
  const secure = process.env.NODE_ENV === 'production';

  const cookieString = [
    `${AUTH_COOKIE_NAME}=${encodeURIComponent(value)}`,
    `path=/`,
    maxAge ? `max-age=${maxAge}` : '',
    secure ? 'secure' : '',
    'samesite=lax'
  ].filter(Boolean).join('; ');

  document.cookie = cookieString;
  console.log('🍪 Cookie de autenticación establecida');
}

/**
 * Obtener cookie de autenticación
 */
export function getAuthCookie(): string | null {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split(';');
  const authCookie = cookies.find(cookie => 
    cookie.trim().startsWith(`${AUTH_COOKIE_NAME}=`)
  );

  if (!authCookie) return null;

  const value = authCookie.split('=')[1];
  return decodeURIComponent(value);
}

/**
 * Eliminar cookie de autenticación
 */
export function removeAuthCookie(): void {
  if (typeof document === 'undefined') return;

  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0`;
  console.log('🍪 Cookie de autenticación eliminada');
}

/**
 * Verificar si hay cookie de autenticación válida
 */
export function hasValidAuthCookie(): boolean {
  const cookie = getAuthCookie();
  if (!cookie) return false;

  try {
    const data = JSON.parse(cookie);
    return !!(data.userId && data.token);
  } catch {
    return false;
  }
}