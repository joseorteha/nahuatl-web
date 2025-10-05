'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import Header from './Header';
import LandingHeader from './LandingHeader';

export default function ConditionalHeader() {
  // Usar useContext directamente para manejar el caso cuando no está dentro del Provider
  const authContext = useContext(AuthContext);
  
  // Si no está dentro del AuthProvider (como en not-found.tsx), mostrar LandingHeader
  if (!authContext) {
    return <LandingHeader />;
  }

  const { user, loading } = authContext;

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
