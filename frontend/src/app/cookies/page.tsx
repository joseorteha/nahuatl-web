'use client';
import { motion } from 'framer-motion';
import ConditionalHeader from '@/components/navigation/ConditionalHeader';
import Footer from '@/components/navigation/Footer';
import { Cookie, Settings, Eye, Shield, AlertTriangle, Mail, Monitor, Globe, Clock } from 'lucide-react';

export default function CookiesPolicy() {
  return (
    <>
      <ConditionalHeader />
      <main className="min-h-screen bg-slate-50 dark:bg-slate-900">
        {/* Hero Section */}
        <section className="relative pt-20 pb-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-slate-500/10 dark:from-cyan-400/5 dark:via-blue-400/5 dark:to-slate-400/5"></div>
          
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center gap-3 bg-cyan-50 dark:bg-cyan-900/30 px-6 py-3 rounded-full mb-8">
                <Cookie className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                <span className="text-cyan-800 dark:text-cyan-200 font-medium">Política de Cookies</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-slate-100 mb-6">
                Política de
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400">
                  Cookies
                </span>
              </h1>
              
              <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
                Esta política explica cómo Nawatlahtol utiliza cookies y tecnologías similares para mejorar tu experiencia 
                de navegación y proporcionar funcionalidades esenciales en nuestra plataforma.
              </p>
              
              <div className="mt-6 inline-flex items-center gap-2 bg-cyan-50 dark:bg-cyan-900/20 px-4 py-2 rounded-full">
                <Clock className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                <span className="text-sm text-cyan-700 dark:text-cyan-300 font-medium">
                  Última actualización: 16 de septiembre de 2025
                </span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* ¿Qué son las Cookies? */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/60 dark:border-slate-700/60 shadow-lg"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl">
                <Eye className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                ¿Qué son las Cookies?
              </h2>
            </div>
            
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-slate-700 dark:text-slate-300 mb-8 text-lg leading-relaxed">
                Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas un sitio web. 
                Nos ayudan a recordar tus preferencias, mantener tu sesión activa y mejorar la funcionalidad de la plataforma.
              </p>
              
              <div className="bg-cyan-50 dark:bg-cyan-900/20 p-8 rounded-xl border border-cyan-200 dark:border-cyan-800">
                <h3 className="text-xl font-semibold text-cyan-800 dark:text-cyan-200 mb-6">
                  Características de las Cookies
                </h3>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 text-white rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Clock className="h-6 w-6" />
                    </div>
                    <h4 className="font-semibold text-cyan-800 dark:text-cyan-200 mb-2">Temporales</h4>
                    <p className="text-sm text-cyan-700 dark:text-cyan-300">
                      Se eliminan automáticamente cuando cierras el navegador
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Monitor className="h-6 w-6" />
                    </div>
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Persistentes</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Permanecen hasta una fecha específica o hasta que las elimines manualmente
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Shield className="h-6 w-6" />
                    </div>
                    <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Seguras</h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      No pueden ejecutar programas ni contener virus en tu dispositivo
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Tipos de Cookies que Utilizamos */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/60 dark:border-slate-700/60 shadow-lg"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Tipos de Cookies que Utilizamos
              </h2>
            </div>
            
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-cyan-50 dark:bg-cyan-900/20 p-6 rounded-lg border border-cyan-200 dark:border-cyan-800">
                  <h4 className="font-semibold text-cyan-800 dark:text-cyan-200 mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-cyan-600" />
                    Cookies Estrictamente Necesarias
                  </h4>
                  <p className="text-cyan-700 dark:text-cyan-300 mb-4 text-sm">
                    Esenciales para el funcionamiento básico de la plataforma. No pueden ser desactivadas.
                  </p>
                  <ul className="space-y-2 text-cyan-700 dark:text-cyan-300 text-sm">
                    <li>• Mantener tu sesión de usuario activa</li>
                    <li>• Recordar tu estado de autenticación</li>
                    <li>• Configuraciones de seguridad</li>
                    <li>• Preferencias de accesibilidad</li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-4 flex items-center gap-2">
                    <Settings className="h-5 w-5 text-blue-600" />
                    Cookies de Funcionalidad
                  </h4>
                  <p className="text-blue-700 dark:text-blue-300 mb-4 text-sm">
                    Mejoran la experiencia del usuario recordando preferencias y configuraciones.
                  </p>
                  <ul className="space-y-2 text-blue-700 dark:text-blue-300 text-sm">
                    <li>• Tema preferido (claro/oscuro)</li>
                    <li>• Idioma de la interfaz</li>
                    <li>• Configuraciones de usuario</li>
                    <li>• Progreso en lecciones</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold text-green-800 dark:text-green-200 mb-4 flex items-center gap-2">
                    <Eye className="h-5 w-5 text-green-600" />
                    Cookies de Rendimiento
                  </h4>
                  <p className="text-green-700 dark:text-green-300 mb-4 text-sm">
                    Nos ayudan a entender cómo los usuarios interactúan con la plataforma para mejorarla.
                  </p>
                  <ul className="space-y-2 text-green-700 dark:text-green-300 text-sm">
                    <li>• Análisis de uso de funcionalidades</li>
                    <li>• Tiempo de permanencia en páginas</li>
                    <li>• Errores técnicos reportados</li>
                    <li>• Optimización de rendimiento</li>
                  </ul>
                </div>
                
                <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg border border-orange-200 dark:border-orange-800">
                  <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-4 flex items-center gap-2">
                    <Globe className="h-5 w-5 text-orange-600" />
                    Cookies de Terceros
                  </h4>
                  <p className="text-orange-700 dark:text-orange-300 mb-4 text-sm">
                    Proporcionadas por servicios externos que utilizamos para funcionalidades específicas.
                  </p>
                  <ul className="space-y-2 text-orange-700 dark:text-orange-300 text-sm">
                    <li>• Autenticación con Google/Facebook</li>
                    <li>• Servicios de hosting y CDN</li>
                    <li>• Análisis web básico</li>
                    <li>• Funcionalidades de respaldo</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Gestión de Cookies */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/60 dark:border-slate-700/60 shadow-lg"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Gestión y Control de Cookies
              </h2>
            </div>
            
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-slate-700 dark:text-slate-300 mb-8 text-lg leading-relaxed">
                Tienes control total sobre las cookies en tu dispositivo. Puedes gestionarlas a través de 
                la configuración de tu navegador o utilizando nuestro panel de preferencias.
              </p>
              
              <div className="bg-green-50 dark:bg-green-900/20 p-8 rounded-xl border border-green-200 dark:border-green-800 mb-8">
                <h3 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-6">
                  Opciones de Control
                </h3>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                        Configuración del Navegador
                      </h4>
                      <p className="text-green-700 dark:text-green-300 text-sm">
                        Puedes bloquear, eliminar o gestionar cookies directamente desde la configuración 
                        de privacidad de tu navegador web.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                        Panel de Preferencias (Próximamente)
                      </h4>
                      <p className="text-blue-700 dark:text-blue-300 text-sm">
                        Implementaremos un centro de preferencias donde podrás seleccionar qué tipos 
                        de cookies aceptar o rechazar.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-cyan-600 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm font-bold">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-cyan-800 dark:text-cyan-200 mb-2">
                        Navegación Privada
                      </h4>
                      <p className="text-cyan-700 dark:text-cyan-300 text-sm">
                        Utiliza el modo incógnito/privado de tu navegador para una sesión sin cookies persistentes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                      Importante: Impacto en la Funcionalidad
                    </h4>
                    <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                      Si desactivas las cookies esenciales, algunas funcionalidades de Nawatlahtol pueden no funcionar 
                      correctamente, incluyendo el inicio de sesión, el guardado de progreso y las preferencias personalizadas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Cookies Específicas que Utilizamos */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/60 dark:border-slate-700/60 shadow-lg"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Cookies Específicas de Nawatlahtol
              </h2>
            </div>
            
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-slate-300 dark:border-slate-600 text-sm">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800">
                      <th className="border border-slate-300 dark:border-slate-600 p-3 text-left font-semibold">Nombre</th>
                      <th className="border border-slate-300 dark:border-slate-600 p-3 text-left font-semibold">Propósito</th>
                      <th className="border border-slate-300 dark:border-slate-600 p-3 text-left font-semibold">Duración</th>
                      <th className="border border-slate-300 dark:border-slate-600 p-3 text-left font-semibold">Tipo</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-700 dark:text-slate-300">
                    <tr>
                      <td className="border border-slate-300 dark:border-slate-600 p-3 font-mono">sb-access-token</td>
                      <td className="border border-slate-300 dark:border-slate-600 p-3">Token de autenticación de Supabase</td>
                      <td className="border border-slate-300 dark:border-slate-600 p-3">1 hora</td>
                      <td className="border border-slate-300 dark:border-slate-600 p-3">Esencial</td>
                    </tr>
                    <tr className="bg-slate-50 dark:bg-slate-800/50">
                      <td className="border border-slate-300 dark:border-slate-600 p-3 font-mono">sb-refresh-token</td>
                      <td className="border border-slate-300 dark:border-slate-600 p-3">Renovación automática de sesión</td>
                      <td className="border border-slate-300 dark:border-slate-600 p-3">30 días</td>
                      <td className="border border-slate-300 dark:border-slate-600 p-3">Esencial</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 dark:border-slate-600 p-3 font-mono">theme-preference</td>
                      <td className="border border-slate-300 dark:border-slate-600 p-3">Preferencia de tema (claro/oscuro)</td>
                      <td className="border border-slate-300 dark:border-slate-600 p-3">1 año</td>
                      <td className="border border-slate-300 dark:border-slate-600 p-3">Funcionalidad</td>
                    </tr>
                    <tr className="bg-slate-50 dark:bg-slate-800/50">
                      <td className="border border-slate-300 dark:border-slate-600 p-3 font-mono">lesson-progress</td>
                      <td className="border border-slate-300 dark:border-slate-600 p-3">Progreso actual en lecciones</td>
                      <td className="border border-slate-300 dark:border-slate-600 p-3">Sesión</td>
                      <td className="border border-slate-300 dark:border-slate-600 p-3">Funcionalidad</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 dark:border-slate-600 p-3 font-mono">user-settings</td>
                      <td className="border border-slate-300 dark:border-slate-600 p-3">Configuraciones personalizadas</td>
                      <td className="border border-slate-300 dark:border-slate-600 p-3">90 días</td>
                      <td className="border border-slate-300 dark:border-slate-600 p-3">Funcionalidad</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </motion.section>

          {/* Cambios en la Política */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/60 dark:border-slate-700/60 shadow-lg"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Actualizaciones de esta Política
              </h2>
            </div>
            
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-8 rounded-xl border border-indigo-200 dark:border-indigo-800">
              <p className="text-indigo-800 dark:text-indigo-200 text-lg mb-6 leading-relaxed">
                Podemos actualizar esta política de cookies periódicamente para reflejar cambios en nuestras 
                prácticas, tecnologías utilizadas o requisitos legales.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full mt-3 flex-shrink-0"></div>
                  <p className="text-indigo-700 dark:text-indigo-300">
                    <strong>Notificación:</strong> Te informaremos sobre cambios significativos a través de 
                    un aviso en la plataforma o por correo electrónico.
                  </p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full mt-3 flex-shrink-0"></div>
                  <p className="text-indigo-700 dark:text-indigo-300">
                    <strong>Revisión regular:</strong> Te recomendamos revisar esta política periódicamente 
                    para mantenerte informado sobre nuestras prácticas.
                  </p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full mt-3 flex-shrink-0"></div>
                  <p className="text-indigo-700 dark:text-indigo-300">
                    <strong>Fecha de vigencia:</strong> Los cambios entran en vigor inmediatamente tras 
                    su publicación, salvo que se indique lo contrario.
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Contacto */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-2xl p-12 text-white text-center"
          >
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold">¿Preguntas sobre Cookies?</h2>
            </div>
            
            <p className="text-xl text-slate-300 mb-8 leading-relaxed max-w-2xl mx-auto">
              Si tienes preguntas sobre nuestra política de cookies, necesitas ayuda para gestionarlas, 
              o quieres más información sobre nuestras prácticas de privacidad:
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <a 
                href="mailto:joseortegahac@gmail.com"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 px-8 py-4 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Mail className="h-5 w-5" />
                joseortegahac@gmail.com
              </a>
              
              <div className="text-slate-400">
                <p>Responsable de privacidad:</p>
                <p className="font-semibold text-white">José Ortega</p>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-slate-700">
              <p className="text-sm text-slate-400 mb-4">
                Nos comprometemos a proteger tu privacidad y a ser transparentes sobre el uso de cookies.
              </p>
              <p className="text-xs text-slate-500">
                Respuesta estimada a consultas sobre cookies: 2-5 días hábiles
              </p>
            </div>
          </motion.section>
        </div>
      </main>
    </>
  );
}