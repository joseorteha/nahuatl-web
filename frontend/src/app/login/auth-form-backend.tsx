'use client';
import { useState, FC, InputHTMLAttributes, ElementType, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthBackend } from '@/hooks/useAuthBackend';
import { 
  Mail, 
  Lock, 
  User, 
  UserCheck, 
  AlertCircle, 
  CheckCircle, 
  Eye, 
  EyeOff, 
  Loader2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

// Define InputField props interface
interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  icon: ElementType;
  label: string;
  error?: string;
}

// Define InputField component outside AuthForm to prevent re-renders on state change
const InputField: FC<InputFieldProps> = ({ icon: Icon, label, error, type, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === 'password';
  const inputType = isPasswordField && showPassword ? 'text' : type;

  return (
    <motion.div 
      className="relative"
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Icon className="text-gray-400 dark:text-gray-500" size={18} />
        </div>
        <input
          {...props}
          type={inputType}
          className={`w-full pl-12 pr-${isPasswordField ? '12' : '4'} py-3 border-2 ${
            error 
              ? 'border-red-300 dark:border-red-600 focus:border-red-500 dark:focus:border-red-400' 
              : 'border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400'
          } rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all duration-200 text-sm`}
        />
        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
          >
            <AlertCircle size={14} />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function AuthFormBackend() {
  const router = useRouter();
  const { login, register, loading } = useAuthBackend();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});

  // Validación en tiempo real
  const validateField = (name: string, value: string) => {
    const newErrors = { ...fieldErrors };
    
    switch (name) {
      case 'email':
        if (!value.includes('@')) {
          newErrors.email = 'Formato de email inválido';
        } else {
          delete newErrors.email;
        }
        break;
      case 'password':
        if (value.length < 6) {
          newErrors.password = 'Mínimo 6 caracteres';
        } else {
          delete newErrors.password;
        }
        break;
      case 'fullName':
        if (isSignUp && value.length < 2) {
          newErrors.fullName = 'Nombre muy corto';
        } else {
          delete newErrors.fullName;
        }
        break;
      case 'username':
        if (isSignUp && value.length > 0 && value.length < 3) {
          newErrors.username = 'Username muy corto';
        } else if (isSignUp && value.length > 0 && !/^[a-zA-Z0-9_]+$/.test(value)) {
          newErrors.username = 'Solo letras, números y _';
        } else {
          delete newErrors.username;
        }
        break;
    }
    
    setFieldErrors(newErrors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isSignUp) {
        // Registro
        const result = await register({
          email,
          password,
          nombre_completo: fullName,
          username: username || undefined
        });

        if (result.success) {
          setSuccess('¡Registro exitoso! Redirigiendo...');
          setTimeout(() => {
            router.push('/dashboard');
          }, 1500);
        } else {
          setError(result.error || 'Error al registrar usuario');
        }
      } else {
        // Login
        const result = await login(email, password);

        if (result.success) {
          setSuccess('¡Login exitoso! Redirigiendo...');
          setTimeout(() => {
            router.push('/dashboard');
          }, 1500);
        } else {
          setError(result.error || 'Credenciales incorrectas');
        }
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Ocurrió un error. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para manejar login con Google
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Redirigir al backend para OAuth
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      window.location.href = `${backendUrl}/api/auth/google`;
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Error al conectar con Google');
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      className="w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header del formulario */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
        >
          <Sparkles className="h-8 w-8 text-white" />
        </motion.div>
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {isSignUp ? '¡Únete a nosotros!' : '¡Bienvenido de vuelta!'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {isSignUp 
            ? 'Crea tu cuenta y comienza tu viaje en el náhuatl' 
            : 'Continúa tu aventura de aprendizaje'}
        </p>
      </div>

      {/* Mensajes de error y éxito */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="mb-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-400 text-red-700 dark:text-red-300 p-4 rounded-lg"
          >
            <div className="flex items-center">
              <AlertCircle className="mr-3 flex-shrink-0" size={20} />
              <span className="text-sm font-medium">{error}</span>
            </div>
          </motion.div>
        )}
        
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="mb-6 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 dark:border-green-400 text-green-700 dark:text-green-300 p-4 rounded-lg"
          >
            <div className="flex items-center">
              <CheckCircle className="mr-3 flex-shrink-0" size={20} />
              <span className="text-sm font-medium">{success}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-6">
        <AnimatePresence mode="wait">
          {isSignUp && (
            <motion.div
              key="signup-fields"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <InputField
                id="fullName"
                icon={User}
                label="Nombre Completo"
                type="text"
                placeholder="Tu nombre completo"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  validateField('fullName', e.target.value);
                }}
                error={fieldErrors.fullName}
                autoComplete="name"
                required
              />
              <InputField
                id="username"
                icon={UserCheck}
                label="Nombre de Usuario (opcional)"
                type="text"
                placeholder="Elige un nombre único"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  validateField('username', e.target.value);
                }}
                error={fieldErrors.username}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <InputField
          id="email"
          icon={Mail}
          label="Correo Electrónico"
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            validateField('email', e.target.value);
          }}
          error={fieldErrors.email}
          autoComplete="email"
          required
        />

        <InputField
          id="password"
          icon={Lock}
          label="Contraseña"
          type="password"
          placeholder="Mínimo 6 caracteres"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            validateField('password', e.target.value);
          }}
          error={fieldErrors.password}
          autoComplete={isSignUp ? 'new-password' : 'current-password'}
          required
        />

        <motion.button
          type="submit"
          disabled={isLoading || Object.keys(fieldErrors).length > 0}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:via-gray-400 disabled:to-gray-400 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>Procesando...</span>
            </>
          ) : (
            <>
              <span>{isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}</span>
              <ArrowRight size={18} />
            </>
          )}
        </motion.button>

        {/* Separador */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 font-medium">
              O continúa con
            </span>
          </div>
        </div>

        {/* Botón de Google */}
        <motion.button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-white dark:bg-slate-700 border-2 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300 font-semibold py-3 px-6 rounded-xl transition-all duration-300 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700/30 shadow-md hover:shadow-lg flex items-center justify-center gap-3"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" className="flex-shrink-0">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>Continuar con Google</span>
        </motion.button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
              setSuccess(null);
              setFieldErrors({});
            }}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium transition-colors duration-200 underline decoration-2 underline-offset-4"
          >
            {isSignUp ? '¿Ya tienes una cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate gratis'}
          </button>
        </div>
      </form>

      {/* Información adicional */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8 text-center"
      >
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            🔒 Tus datos están seguros. Solo usamos la información necesaria para mejorar tu experiencia de aprendizaje.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
