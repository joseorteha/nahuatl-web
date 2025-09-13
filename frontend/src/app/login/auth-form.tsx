'use client';
import { useState, FC, InputHTMLAttributes, ElementType } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
    }
    
    setFieldErrors(newErrors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Timeout para mostrar mensaje informativo sobre servidor lento
      const timeoutId = setTimeout(() => {
        if (isLoading) {
          setError('El servidor está iniciando. Esto puede tomar unos momentos la primera vez.');
        }
      }, 3000);

      if (isSignUp) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://nahuatl-web.onrender.com'}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre_completo: fullName, email, password, username }),
        });
        clearTimeout(timeoutId);
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Error al registrar usuario.');
        
        setSuccess('¡Registro exitoso! Ahora puedes iniciar sesión.');
        setIsSignUp(false);
        setFullName('');
        setPassword('');
        setUsername('');
      } else {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://nahuatl-web.onrender.com'}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emailOrUsername: email, password }),
        });
        clearTimeout(timeoutId);
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
                onChange={(e) => setUsername(e.target.value)}
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