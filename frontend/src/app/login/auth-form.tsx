'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Mail, Lock, User, UserCheck, AlertCircle, CheckCircle } from 'lucide-react';
import type { Database } from '@/lib/database.types';

export default function AuthForm() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    username: ''
  });

  const supabase = createClientComponentClient<Database>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isSignUp) {
        // Registro personalizado
        const response = await fetch('http://localhost:3001/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            username: formData.username,
            password: formData.password,
            full_name: formData.full_name
          })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Error al registrar usuario.');
        setSuccess('¡Registro exitoso! Ahora puedes iniciar sesión.');
        setFormData({ full_name: '', email: '', password: '', username: '' });
      } else {
        // Login personalizado
        const response = await fetch('http://localhost:3001/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            emailOrUsername: formData.email,
            password: formData.password
          })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Credenciales incorrectas.');
        
        // Guardar usuario en localStorage para persistir la sesión
        localStorage.setItem('user', JSON.stringify(result.user));

        setSuccess('¡Bienvenido!');
        // Redirigir a la página principal después de un login exitoso
        router.push('/');
      }
    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message || 'Ocurrió un error. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-emerald-400 mb-2">
          {isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
        </h2>
        <p className="text-gray-400">
          {isSignUp 
            ? 'Únete a Timumachtikan Nawatl' 
            : 'Bienvenido de vuelta'
          }
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg flex items-center gap-3">
          <AlertCircle className="text-red-400" size={20} />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg flex items-center gap-3">
          <CheckCircle className="text-green-400" size={20} />
          <p className="text-green-400 text-sm">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignUp && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nombre Completo *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                placeholder="Tu nombre completo"
                required={isSignUp}
              />
            </div>
          </div>
        )}

        {isSignUp && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nombre de Usuario (opcional)
            </label>
            <div className="relative">
              <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                placeholder="usuario123"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Correo Electrónico *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              placeholder="tu@email.com"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Contraseña *
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              {isSignUp ? 'Creando cuenta...' : 'Iniciando sesión...'}
            </div>
          ) : (
            isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError(null);
            setSuccess(null);
            setFormData({ full_name: '', email: '', password: '', username: '' });
          }}
          className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors"
        >
          {isSignUp 
            ? '¿Ya tienes cuenta? Inicia sesión' 
            : '¿No tienes cuenta? Regístrate'
          }
        </button>
      </div>

      {isSignUp && (
        <div className="mt-6 p-4 bg-amber-900/20 border border-amber-500/30 rounded-lg">
          <p className="text-amber-200 text-sm">
            💡 <strong>Importante:</strong> Después del registro, revisa tu correo electrónico para confirmar tu cuenta antes de iniciar sesión.
          </p>
        </div>
      )}
    </div>
  );
}
