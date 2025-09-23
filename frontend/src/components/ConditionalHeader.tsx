'use client';
import { useAuthBackend } from '@/hooks/useAuthBackend';
import Header from './Header';
import LandingHeader from './LandingHeader';

export default function ConditionalHeader() {
  const { user, loading } = useAuthBackend();

  // Si está cargando, mostrar LandingHeader por defecto
  if (loading) {
    return <LandingHeader />;
  }

  // Si está logueado, mostrar Header completo
  if (user) {
    return <Header />;
  }

  // Si no está logueado, mostrar LandingHeader (solo enlaces públicos)
  return <LandingHeader />;
}
