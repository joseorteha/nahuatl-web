'use client';
import { useState } from 'react';
import { supabase } from '@/lib/config/supabaseClient';

export default function MigrationPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const migrateUser = async () => {
    if (!email || !password) {
      setStatus('❌ Por favor ingresa email y contraseña');
      return;
    }

    setLoading(true);
    setStatus('🔄 Verificando usuario en base de datos...');

    try {
      // 1. Verificar si el usuario existe en la tabla perfiles
      const { data: existingProfile, error: profileError } = await supabase
        .from('perfiles')
        .select('*')
        .eq('email', email)
        .single();

      if (profileError || !existingProfile) {
        setStatus('❌ Usuario no encontrado en la base de datos');
        return;
      }

      if (!existingProfile.password) {
        setStatus('ℹ️ Este usuario ya es OAuth, no necesita migración');
        return;
      }

      setStatus('🔄 Creando usuario en Supabase Auth...');

      // 2. Crear el usuario en Supabase Auth
      const { error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: existingProfile.nombre_completo,
            username: existingProfile.username
          }
        }
      });

      if (error) {
        setStatus(`❌ Error al crear usuario en Supabase Auth: ${error.message}`);
        return;
      }

      setStatus('✅ Usuario migrado exitosamente! Revisa tu email para confirmar la cuenta y luego podrás hacer login normalmente.');

    } catch (error) {
      setStatus(`❌ Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">🔄 Migración de Usuario</h1>
        <p className="text-gray-600 mb-6 text-center">
          Si tienes una cuenta antigua con email/contraseña, úsala aquí para migrarla a Supabase Auth.
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña Actual
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tu contraseña actual"
            />
          </div>

          <button
            onClick={migrateUser}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '🔄 Migrando...' : '🚀 Migrar Usuario'}
          </button>
        </div>

        {status && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <p className="text-sm">{status}</p>
          </div>
        )}

        <div className="mt-6 text-center">
          <a href="/login" className="text-blue-600 hover:underline">
            ← Volver al Login
          </a>
        </div>
      </div>
    </div>
  );
}