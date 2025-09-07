'use client';
import { useState, FC, InputHTMLAttributes, ElementType } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, UserCheck, AlertCircle, CheckCircle } from 'lucide-react';

// Define InputField props interface
interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  icon: ElementType;
}

// Define InputField component outside AuthForm to prevent re-renders on state change
const InputField: FC<InputFieldProps> = ({ icon: Icon, ...props }) => (
  <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <Icon className="text-neutral-400" size={18} />
    </div>
    <input
      {...props}
      className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-md text-neutral-800 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-200 text-sm"
    />
  </div>
);

export default function AuthForm() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isSignUp) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://nahuatl-web.onrender.com'}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre_completo: fullName, email, password, username }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Error al registrar usuario.');
        
        setSuccess('¡Registro exitoso! Ahora puedes iniciar sesión.');
        setIsSignUp(false); // Switch to login view
        setFullName('');
        setPassword('');
        setUsername('');
        // Keep email for user convenience
      } else {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://nahuatl-web.onrender.com'}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emailOrUsername: email, password }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Credenciales incorrectas.');

        localStorage.setItem('user', JSON.stringify(result.user));
        if (result.token) {
          localStorage.setItem('token', result.token);
        }
        router.push('/dashboard');
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Ocurrió un error. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded-md flex items-center text-sm">
          <AlertCircle className="mr-2" size={16}/>
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="mb-4 bg-green-50 border-l-4 border-green-500 text-green-700 p-3 rounded-md flex items-center text-sm">
          <CheckCircle className="mr-2" size={16}/>
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignUp && (
          <>
            <InputField
              id="fullName"
              icon={User}
              type="text"
              placeholder="Nombre Completo"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
              required
            />
            <InputField
              id="username"
              icon={UserCheck}
              type="text"
              placeholder="Nombre de Usuario (opcional)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </>
        )}

        <InputField
          id="email"
          icon={Mail}
          type="email"
          placeholder="correo@ejemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />

        <InputField
          id="password"
          icon={Lock}
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={isSignUp ? 'new-password' : 'current-password'}
          required
        />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-neutral-400 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
          ) : (
            isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'
          )}
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
              setSuccess(null);
            }}
            className="text-amber-600 hover:text-amber-700 text-sm transition-colors duration-200"
          >
            {isSignUp ? '¿Ya tienes una cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
          </button>
        </div>
      </form>
    </div>
  );
}
