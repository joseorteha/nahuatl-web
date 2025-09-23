'use client';
import { motion } from 'framer-motion';
import ConditionalHeader from '@/components/ConditionalHeader';
import { Shield, Mail, Eye, Lock, Users, FileText, Database, Settings, AlertTriangle, CheckCircle, Globe, Heart } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <>
      <ConditionalHeader />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-tr from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-16 max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-6">
              Política de <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Privacidad</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
              En <strong className="text-slate-900 dark:text-slate-100">Nawatlahtol</strong> nos comprometemos a proteger tu privacidad y manejar tu información personal de manera transparente y segura.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 bg-cyan-50 dark:bg-cyan-900/20 px-4 py-2 rounded-full text-sm text-cyan-700 dark:text-cyan-300 border border-cyan-200/50 dark:border-cyan-700/30">
              <CheckCircle className="h-4 w-4" />
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
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/60 dark:border-slate-700/60 shadow-lg"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  <Eye className="h-6 w-6 text-white" />
                </div>
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
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/60 dark:border-slate-700/60 shadow-lg"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Settings className="h-6 w-6 text-white" />
                </div>
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
                        <div className="w-2 h-2 bg-cyan-500 rounded-full mt-3 flex-shrink-0"></div>
                        Proporcionar acceso a tu cuenta personal
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-cyan-500 rounded-full mt-3 flex-shrink-0"></div>
                        Guardar y sincronizar tu progreso de aprendizaje
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-cyan-500 rounded-full mt-3 flex-shrink-0"></div>
                        Permitir contribuciones al diccionario comunitario
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-cyan-500 rounded-full mt-3 flex-shrink-0"></div>
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
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/60 dark:border-slate-700/60 shadow-lg"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <Lock className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  Protección y Seguridad de Datos
                </h2>
              </div>
              
              <div className="bg-cyan-50 dark:bg-cyan-900/20 p-8 rounded-xl border border-cyan-200 dark:border-cyan-800">
                <h3 className="text-xl font-semibold text-cyan-800 dark:text-cyan-200 mb-6">
                  Compromiso de Confidencialidad
                </h3>
                <p className="text-cyan-700 dark:text-cyan-300 text-lg leading-relaxed mb-6">
                  No vendemos, alquilamos, intercambiamos ni transferimos tu información personal a terceros sin tu consentimiento explícito, excepto en las circunstancias limitadas descritas a continuación.
                </p>
                
                <h4 className="font-semibold text-cyan-800 dark:text-cyan-200 mb-4">Compartimos información únicamente cuando:</h4>
                <ul className="space-y-3 text-cyan-700 dark:text-cyan-300">
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
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/60 dark:border-slate-700/60 shadow-lg"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  Tus Derechos como Usuario
                </h2>
              </div>
              
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-slate-700 dark:text-slate-300 mb-8 text-lg leading-relaxed">
                  Como usuario de nuestra plataforma, tienes derecho a ejercer los siguientes derechos sobre tu información personal:
                </p>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-cyan-50 dark:bg-cyan-900/20 p-6 rounded-xl text-center border border-cyan-200/50 dark:border-cyan-700/30 hover:border-cyan-300/60 dark:hover:border-cyan-600/60 transition-all duration-300">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 text-white rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Eye className="h-6 w-6" />
                    </div>
                    <h4 className="font-semibold text-cyan-800 dark:text-cyan-200 mb-3">Derecho de Acceso</h4>
                    <p className="text-sm text-cyan-700 dark:text-cyan-300">
                      Solicitar una copia completa de toda la información personal que tenemos sobre ti
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl text-center border border-blue-200/50 dark:border-blue-700/30 hover:border-blue-300/60 dark:hover:border-blue-600/60 transition-all duration-300">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Settings className="h-6 w-6" />
                    </div>
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">Derecho de Rectificación</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Actualizar, corregir o modificar información incorrecta o desactualizada
                    </p>
                  </div>
                  
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-xl text-center border border-orange-200/50 dark:border-orange-700/30 hover:border-orange-300/60 dark:hover:border-orange-600/60 transition-all duration-300">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg flex items-center justify-center mx-auto mb-4">
                      <AlertTriangle className="h-6 w-6" />
                    </div>
                    <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-3">Derecho de Supresión</h4>
                    <p className="text-sm text-orange-700 dark:text-orange-300">
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
              className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-2xl p-12 text-white text-center shadow-2xl"
            >
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold">Contacto para Asuntos de Privacidad</h2>
              </div>
              
              <p className="text-xl text-slate-300 mb-8 leading-relaxed max-w-2xl mx-auto">
                Si tienes preguntas sobre esta política de privacidad, deseas ejercer alguno de tus derechos, 
                o necesitas asistencia relacionada con el manejo de tu información personal, contáctanos:
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <a 
                  href="mailto:joseortegahac@gmail.com"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
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