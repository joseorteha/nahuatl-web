# 🔥 SOLUCIÓN: Memory Leak de Autenticación

## Problema Detectado

**Síntoma**: ~150+ peticiones simultáneas al endpoint `/api/auth/profile/[id]` en 6 segundos desde la landing page.

**Error**: `ERR_INSUFFICIENT_RESOURCES` - El navegador agotó recursos por exceso de peticiones.

## Causa Raíz

Cada componente que importaba `useAuthBackend` creaba una **instancia independiente** del hook. Con múltiples componentes en la página principal (Header, Footer, etc.), cada uno iniciaba su propia verificación de token, causando un efecto cascada.

```
Landing Page
├── Header (usa useAuthBackend) → Petición 1
├── ConditionalHeader (usa useAuthBackend) → Petición 2
├── Footer (usa useAuthBackend) → Petición 3
├── AuthDebug (usa useAuthBackend) → Petición 4
└── ... (más componentes) → Peticiones N
```

## Solución Implementada

### 1. **Request Pooling Global** (`useAuthBackend.ts`)

Sistema que evita peticiones duplicadas simultáneas:

```typescript
const pendingRequests = new Map<string, Promise<any>>();

function getOrCreateRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key) as Promise<T>; // Reutilizar petición existente
  }
  
  const promise = requestFn().finally(() => pendingRequests.delete(key));
  pendingRequests.set(key, promise);
  return promise;
}
```

### 2. **Debounce de Verificación de Token**

Cambio de 1 segundo → **2 segundos** para dar tiempo a que todos los componentes se monten antes de verificar:

```typescript
setTimeout(async () => {
  const requestKey = `verify-token-${storedUser.id}`;
  await getOrCreateRequest(requestKey, async () => {
    // Verificación única compartida
  });
}, 2000); // Esperar 2 segundos
```

### 3. **AuthContext Global** (`contexts/AuthContext.tsx`)

**UNA SOLA INSTANCIA** del hook para toda la aplicación:

```tsx
// contexts/AuthContext.tsx
export function AuthProvider({ children }) {
  const auth = useAuthBackend(); // ✅ SOLO SE CREA UNA VEZ
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
```

## Migración de Componentes

### ❌ ANTES (Múltiples instancias)

```tsx
import { useAuthBackend } from '@/hooks/useAuthBackend';

function Header() {
  const { user, loading, isAuthenticated } = useAuthBackend(); // ❌ Nueva instancia
  // ...
}
```

### ✅ DESPUÉS (Instancia compartida)

```tsx
import { useAuth } from '@/contexts/AuthContext';

function Header() {
  const { user, loading, isAuthenticated } = useAuth(); // ✅ Instancia compartida
  // ...
}
```

## Componentes a Migrar

Buscar y reemplazar en TODOS los componentes:

```bash
# PowerShell
Get-ChildItem -Path "frontend/src" -Recurse -Filter "*.tsx" | 
  Select-String "useAuthBackend" -List | 
  Select-Object Path
```

**Archivos comunes a revisar:**

- ✅ `app/layout.tsx` - Ya migrado (incluye AuthProvider)
- ⏳ `components/navigation/Header.tsx`
- ⏳ `components/navigation/ConditionalHeader.tsx`
- ⏳ `components/navigation/Footer.tsx`
- ⏳ `components/debug/AuthDebug.tsx`
- ⏳ `app/dashboard/page.tsx`
- ⏳ `app/profile/page.tsx`
- ⏳ Cualquier otro componente que use autenticación

## Pasos de Migración

### 1. Buscar todos los usos de `useAuthBackend`:

```tsx
// Buscar esta línea:
import { useAuthBackend } from '@/hooks/useAuthBackend';
const { ... } = useAuthBackend();
```

### 2. Reemplazar por `useAuth`:

```tsx
// Reemplazar con:
import { useAuth } from '@/contexts/AuthContext';
const { ... } = useAuth();
```

### 3. Verificar que el componente NO sea el layout raíz

El `AuthProvider` ya está en `app/layout.tsx`, todos los demás componentes deben usar `useAuth()`.

## Beneficios

✅ **~150 peticiones → 1 petición** por carga de página  
✅ **Sin ERR_INSUFFICIENT_RESOURCES**  
✅ **Mejor rendimiento y experiencia de usuario**  
✅ **Consistencia en el estado de autenticación**  
✅ **Uso eficiente de recursos del navegador y servidor**

## Testing

Después de migrar, verificar:

1. **Abrir DevTools → Network**
2. **Recargar la página principal**
3. **Filtrar por `/api/auth/profile`**
4. **Verificar que solo hay 1 petición (después de 2 segundos)**

**ANTES**: 150+ peticiones en 6 segundos ❌  
**DESPUÉS**: 1 petición después de 2 segundos ✅

## Próximos Pasos

1. **Compilar y probar**: `npm run build && npm run dev`
2. **Migrar componentes uno por uno**
3. **Verificar en navegador** que las peticiones disminuyen
4. **Remover console.logs de debug** cuando todo funcione

---

**Fecha**: 2025-10-05  
**Prioridad**: 🔥 CRÍTICA  
**Estado**: Implementado, pendiente migración de componentes
