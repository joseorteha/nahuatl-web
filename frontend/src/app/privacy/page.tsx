'use client';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import { Shield, Mail, Eye, Lock, Users, FileText, Database, Settings, AlertTriangle } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-6">
              Política de Privacidad
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
              En Nahuatlajtol nos comprometemos a proteger tu privacidad y manejar tu información personal de manera transparente y segura.
            </p>
            <div className="mt-6 text-sm text-slate-500 dark:text-slate-400">
              Última actualización: 16 de septiembre de 2025
            </div>
          </motion.div>

          {/* Content */}
          <div className="space-y-12">
            {/* Información que Recopilamos */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="border-l-4 border-blue-600 pl-8"
            >
              <div className="flex items-center gap-4 mb-8">
                <Eye className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  Información que Recopilamos
                </h2>
              </div>
              
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">Datos de Registro</h3>
                <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
                  Cuando creas una cuenta en nuestra plataforma, recopilamos la siguiente información necesaria para proporcionar nuestros servicios:
                </p>
                
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg">
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      Información Personal
                    </h4>
                    <ul className="space-y-2 text-slate-700 dark:text-slate-300">
                      <li>• Nombre completo</li>
                      <li>• Dirección de correo electrónico</li>
                      <li>• Foto de perfil (opcional)</li>
                      <li>• Fecha de registro</li>
                    </ul>
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg">
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                      <Database className="h-5 w-5 text-green-600" />
                      Datos de Actividad
                    </h4>
                    <ul className="space-y-2 text-slate-700 dark:text-slate-300">
                      <li>• Progreso en el aprendizaje</li>
                      <li>• Contribuciones al diccionario</li>
                      <li>• Palabras guardadas o favoritas</li>
                      <li>• Configuraciones de la aplicación</li>
                    </ul>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">Autenticación con Terceros</h3>
                <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
                  Si eliges registrarte usando Google o Facebook, únicamente accedemos a la información básica de tu perfil público (nombre, email y foto de perfil) con tu consentimiento explícito.
                </p>
              </div>
            </motion.section>

            {/* Uso de la Información */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="border-l-4 border-green-600 pl-8"
            >
              <div className="flex items-center gap-4 mb-8">
                <Settings className="h-8 w-8 text-green-600 dark:text-green-400" />
                <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  Cómo Utilizamos tu Información
                </h2>
              </div>
              
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-slate-700 dark:text-slate-300 mb-8 text-lg leading-relaxed">
                  Utilizamos tu información personal únicamente para los siguientes propósitos legítimos:
                </p>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Funcionalidad de la Plataforma</h4>
                    <ul className="space-y-3 text-slate-700 dark:text-slate-300">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-3 flex-shrink-0"></div>
                        Proporcionar acceso a tu cuenta personal
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-3 flex-shrink-0"></div>
                        Guardar y sincronizar tu progreso de aprendizaje
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-3 flex-shrink-0"></div>
                        Permitir contribuciones al diccionario comunitario
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-3 flex-shrink-0"></div>
                        Personalizar tu experiencia educativa
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Comunicación y Soporte</h4>
                    <ul className="space-y-3 text-slate-700 dark:text-slate-300">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-3 flex-shrink-0"></div>
                        Enviar notificaciones sobre el estado de tus contribuciones
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-3 flex-shrink-0"></div>
                        Comunicar actualizaciones importantes de la plataforma
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-3 flex-shrink-0"></div>
                        Proporcionar asistencia técnica cuando sea solicitada
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-3 flex-shrink-0"></div>
                        Responder a consultas o reportes de problemas
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Protección de Datos */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="border-l-4 border-purple-600 pl-8"
            >
              <div className="flex items-center gap-4 mb-8">
                <Lock className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  Protección y Seguridad de Datos
                </h2>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 p-8 rounded-xl border border-purple-200 dark:border-purple-800">
                <h3 className="text-xl font-semibold text-purple-800 dark:text-purple-200 mb-6">
                  Compromiso de Confidencialidad
                </h3>
                <p className="text-purple-700 dark:text-purple-300 text-lg leading-relaxed mb-6">
                  No vendemos, alquilamos, intercambiamos ni transferimos tu información personal a terceros sin tu consentimiento explícito, excepto en las circunstancias limitadas descritas a continuación.
                </p>
                
                <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-4">Compartimos información únicamente cuando:</h4>
                <ul className="space-y-3 text-purple-700 dark:text-purple-300">
                  <li>• Has dado tu consentimiento expreso y específico</li>
                  <li>• Es requerido por ley o autoridades competentes</li>
                  <li>• Es necesario para proteger la seguridad y integridad de la plataforma</li>
                  <li>• Con proveedores de servicios esenciales bajo estrictos acuerdos de confidencialidad (hosting, autenticación)</li>
                </ul>
              </div>
            </motion.section>

            {/* Derechos del Usuario */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="border-l-4 border-orange-600 pl-8"
            >
              <div className="flex items-center gap-4 mb-8">
                <FileText className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  Tus Derechos como Usuario
                </h2>
              </div>
              
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-slate-700 dark:text-slate-300 mb-8 text-lg leading-relaxed">
                  Como usuario de nuestra plataforma, tienes derecho a ejercer los siguientes derechos sobre tu información personal:
                </p>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg text-center">
                    <div className="w-12 h-12 bg-orange-600 text-white rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Eye className="h-6 w-6" />
                    </div>
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">Derecho de Acceso</h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      Solicitar una copia completa de toda la información personal que tenemos sobre ti
                    </p>
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg text-center">
                    <div className="w-12 h-12 bg-orange-600 text-white rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Settings className="h-6 w-6" />
                    </div>
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">Derecho de Rectificación</h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      Actualizar, corregir o modificar información incorrecta o desactualizada
                    </p>
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg text-center">
                    <div className="w-12 h-12 bg-orange-600 text-white rounded-lg flex items-center justify-center mx-auto mb-4">
                      <AlertTriangle className="h-6 w-6" />
                    </div>
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">Derecho de Supresión</h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      Solicitar la eliminación completa de tu cuenta y todos los datos asociados
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Contacto */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-slate-900 dark:bg-slate-800 rounded-2xl p-12 text-white text-center"
            >
              <div className="flex items-center justify-center gap-4 mb-8">
                <Mail className="h-10 w-10 text-blue-400" />
                <h2 className="text-3xl font-bold">Contacto para Asuntos de Privacidad</h2>
              </div>
              
              <p className="text-xl text-slate-300 mb-8 leading-relaxed max-w-2xl mx-auto">
                Si tienes preguntas sobre esta política de privacidad, deseas ejercer alguno de tus derechos, 
                o necesitas asistencia relacionada con el manejo de tu información personal, contáctanos:
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <a 
                  href="mailto:joseortegahac@gmail.com"
                  className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-lg font-semibold transition-colors duration-200"
                >
                  <Mail className="h-5 w-5" />
                  joseortegahac@gmail.com
                </a>
                
                <div className="text-slate-400">
                  <p>Responsable del tratamiento de datos:</p>
                  <p className="font-semibold text-white">José Ortega</p>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t border-slate-700">
                <p className="text-sm text-slate-400">
                  Nos comprometemos a responder a todas las consultas de privacidad dentro de un plazo máximo de 30 días hábiles.
                </p>
              </div>
            </motion.section>
          </div>
        </div>
      </main>
    </>
  );
}