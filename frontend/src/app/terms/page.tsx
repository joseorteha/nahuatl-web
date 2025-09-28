'use client';
import { motion } from 'framer-motion';
import ConditionalHeader from '@/components/navigation/ConditionalHeader';
import { Scale, CheckCircle, Users, Book, AlertTriangle, Mail, Shield, FileText, Globe, Clock, Heart, Zap } from 'lucide-react';

export default function TermsOfService() {
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
              <Scale className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-6">
              Términos de <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Servicio</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Estos términos establecen las reglas y responsabilidades para el uso de <strong className="text-slate-900 dark:text-slate-100">Nawatlahtol</strong>, una plataforma educativa dedicada a la preservación y enseñanza del idioma náhuatl.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 bg-cyan-50 dark:bg-cyan-900/20 px-4 py-2 rounded-full text-sm text-cyan-700 dark:text-cyan-300 border border-cyan-200/50 dark:border-cyan-700/30">
              <Clock className="h-4 w-4" />
              Fecha de vigencia: 16 de septiembre de 2025
            </div>
          </motion.div>

          {/* Content */}
          <div className="space-y-12">
            {/* Aceptación de Términos */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/60 dark:border-slate-700/60 shadow-lg"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  Aceptación de los Términos
                </h2>
              </div>
              
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-slate-700 dark:text-slate-300 mb-8 text-lg leading-relaxed">
                  Al registrarte, acceder o utilizar cualquier función de Nahuatlajtol, confirmas que has leído, 
                  comprendido y aceptas estar legalmente vinculado por estos términos de servicio en su totalidad.
                </p>
                
                <div className="bg-green-50 dark:bg-green-900/20 p-8 rounded-xl border border-green-200 dark:border-green-800">
                  <h3 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-4 flex items-center gap-3">
                    <AlertTriangle className="h-6 w-6" />
                    Importante: Lee Antes de Continuar
                  </h3>
                  <p className="text-green-700 dark:text-green-300 leading-relaxed">
                    Si no estás de acuerdo con cualquiera de estos términos, no debes usar esta plataforma. 
                    Tu uso continuado de nuestros servicios constituye tu aceptación de cualquier modificación 
                    a estos términos que publiquemos de tiempo en tiempo.
                  </p>
                </div>
              </div>
            </motion.section>

            {/* Descripción del Servicio */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="border-l-4 border-blue-600 pl-8"
            >
              <div className="flex items-center gap-4 mb-8">
                <Globe className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  Descripción del Servicio
                </h2>
              </div>
              
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-slate-700 dark:text-slate-300 mb-8 text-lg leading-relaxed">
                  Nahuatlajtol es una plataforma educativa digital que proporciona recursos para el aprendizaje 
                  y preservación del idioma náhuatl, incluyendo:
                </p>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg">
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                      <Book className="h-5 w-5 text-blue-600" />
                      Recursos Educativos
                    </h4>
                    <ul className="space-y-2 text-slate-700 dark:text-slate-300">
                      <li>• Diccionario interactivo español-náhuatl</li>
                      <li>• Lecciones estructuradas de gramática</li>
                      <li>• Ejercicios de práctica y evaluación</li>
                      <li>• Material didáctico multimedia</li>
                    </ul>
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg">
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                      <Users className="h-5 w-5 text-green-600" />
                      Características Comunitarias
                    </h4>
                    <ul className="space-y-2 text-slate-700 dark:text-slate-300">
                      <li>• Sistema de contribuciones colaborativas</li>
                      <li>• Seguimiento personalizado del progreso</li>
                      <li>• Comunidad de aprendizaje interactiva</li>
                      <li>• Herramientas de preservación cultural</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Responsabilidades del Usuario */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/60 dark:border-slate-700/60 shadow-lg"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  Responsabilidades del Usuario
                </h2>
              </div>
              
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-slate-700 dark:text-slate-300 mb-8 text-lg leading-relaxed">
                  Como usuario de nuestra plataforma, te comprometes a:
                </p>
                
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">Uso Responsable</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-green-700 dark:text-green-400 mb-3 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Comportamientos Permitidos
                        </h4>
                        <ul className="space-y-2 text-slate-700 dark:text-slate-300 text-sm">
                          <li>• Usar la plataforma para fines educativos legítimos</li>
                          <li>• Contribuir con traducciones precisas y verificadas</li>
                          <li>• Respetar la cultura y tradiciones náhuatl</li>
                          <li>• Mantener un comportamiento respetuoso con otros usuarios</li>
                          <li>• Proporcionar información veraz en tu perfil</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-red-700 dark:text-red-400 mb-3 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          Actividades Prohibidas
                        </h4>
                        <ul className="space-y-2 text-slate-700 dark:text-slate-300 text-sm">
                          <li>• Subir contenido ofensivo, discriminatorio o inadecuado</li>
                          <li>• Intentar acceder a cuentas de otros usuarios</li>
                          <li>• Realizar actividades que comprometan la seguridad del sistema</li>
                          <li>• Usar la plataforma para fines comerciales no autorizados</li>
                          <li>• Distribuir malware o contenido malicioso</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-cyan-50 dark:bg-cyan-900/20 p-8 rounded-xl border border-cyan-200 dark:border-cyan-800">
                    <h3 className="text-xl font-semibold text-cyan-800 dark:text-cyan-200 mb-4">
                      Calidad de las Contribuciones
                    </h3>
                    <p className="text-cyan-700 dark:text-cyan-300 leading-relaxed">
                      Las contribuciones al diccionario deben ser precisas, culturalmente apropiadas y basadas en fuentes confiables. 
                      Nos reservamos el derecho de revisar, editar o rechazar contribuciones que no cumplan con nuestros estándares de calidad.
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Propiedad Intelectual */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/60 dark:border-slate-700/60 shadow-lg"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  Propiedad Intelectual y Licencias
                </h2>
              </div>
              
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <div className="bg-cyan-50 dark:bg-cyan-900/20 p-8 rounded-xl border border-cyan-200 dark:border-cyan-800 mb-8">
                  <h3 className="text-xl font-semibold text-cyan-800 dark:text-cyan-200 mb-4">
                    Licencia de Contribuciones
                  </h3>
                  <p className="text-cyan-700 dark:text-cyan-300 leading-relaxed mb-4">
                    Al contribuir con traducciones, definiciones o cualquier contenido a nuestra plataforma, otorgas a <strong className="text-cyan-800 dark:text-cyan-200">Nawatlahtol</strong> 
                    una licencia perpetua, mundial, no exclusiva, libre de regalías para usar, modificar, distribuir y mostrar 
                    dicho contenido con fines educativos y de preservación cultural.
                  </p>
                  <p className="text-cyan-700 dark:text-cyan-300 leading-relaxed text-sm">
                    Esta licencia permite que tu contribución beneficie a la comunidad global de aprendizaje del náhuatl, 
                    manteniendo siempre la atribución apropiada cuando sea posible.
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Nuestro Contenido</h4>
                    <p className="text-slate-700 dark:text-slate-300 mb-4 text-sm">
                      El software, diseño, texto, gráficos y otros contenidos de la plataforma están protegidos por derechos de autor 
                      y otras leyes de propiedad intelectual.
                    </p>
                    <p className="text-slate-700 dark:text-slate-300 text-sm">
                      Se te otorga una licencia limitada para usar estos materiales únicamente para tu aprendizaje personal 
                      y uso educativo no comercial.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Tu Contenido</h4>
                    <p className="text-slate-700 dark:text-slate-300 mb-4 text-sm">
                      Mantienes la propiedad de cualquier contenido que subas, pero nos otorgas los derechos necesarios 
                      para operar y mejorar la plataforma.
                    </p>
                    <p className="text-slate-700 dark:text-slate-300 text-sm">
                      Eres responsable de asegurar que tienes los derechos necesarios para compartir cualquier contenido 
                      que contribuyas a la plataforma.
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Limitaciones y Restricciones */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/60 dark:border-slate-700/60 shadow-lg"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  Limitaciones de Responsabilidad
                </h2>
              </div>
              
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <div className="bg-red-50 dark:bg-red-900/20 p-8 rounded-xl border border-red-200 dark:border-red-800">
                  <h3 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-6">
                    Descargo de Responsabilidad
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-red-700 dark:text-red-300 mb-3">Servicio &ldquo;Tal Como Es&rdquo;</h4>
                      <p className="text-red-600 dark:text-red-400 text-sm leading-relaxed">
                        Nahuatlajtol se proporciona &ldquo;tal como es&rdquo; sin garantías de ningún tipo, expresas o implícitas. 
                        No garantizamos que el servicio sea ininterrumpido, libre de errores o completamente seguro.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-red-700 dark:text-red-300 mb-3">Precisión del Contenido</h4>
                      <p className="text-red-600 dark:text-red-400 text-sm leading-relaxed">
                        Aunque nos esforzamos por mantener la precisión del contenido educativo, no podemos garantizar 
                        que toda la información sea completamente precisa o esté actualizada en todo momento.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-red-700 dark:text-red-300 mb-3">Limitación de Daños</h4>
                      <p className="text-red-600 dark:text-red-400 text-sm leading-relaxed">
                        En ningún caso seremos responsables por daños indirectos, incidentales, especiales o consecuentes 
                        que resulten del uso o la imposibilidad de usar nuestros servicios.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Modificaciones */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/60 dark:border-slate-700/60 shadow-lg"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  Modificaciones a los Términos
                </h2>
              </div>
              
              <div className="bg-cyan-50 dark:bg-cyan-900/20 p-8 rounded-xl border border-cyan-200 dark:border-cyan-800">
                <p className="text-cyan-800 dark:text-cyan-200 text-lg mb-6 leading-relaxed">
                  Nos reservamos el derecho de modificar estos términos de servicio en cualquier momento para reflejar 
                  cambios en nuestros servicios, requisitos legales o mejores prácticas.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-cyan-600 rounded-full mt-3 flex-shrink-0"></div>
                    <p className="text-cyan-700 dark:text-cyan-300">
                      <strong>Notificación:</strong> Los cambios significativos serán comunicados con al menos 30 días de anticipación 
                      a través de nuestra plataforma o por correo electrónico.
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-cyan-600 rounded-full mt-3 flex-shrink-0"></div>
                    <p className="text-cyan-700 dark:text-cyan-300">
                      <strong>Vigencia:</strong> Tu uso continuado después de la fecha de vigencia constituye 
                      aceptación de los términos modificados.
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-cyan-600 rounded-full mt-3 flex-shrink-0"></div>
                    <p className="text-cyan-700 dark:text-cyan-300">
                      <strong>Derecho de cancelación:</strong> Si no estás de acuerdo con las modificaciones, 
                      puedes cancelar tu cuenta antes de que entren en vigor.
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Contacto Legal */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-2xl p-12 text-white text-center shadow-2xl"
            >
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold">Contacto Legal</h2>
              </div>
              
              <p className="text-xl text-slate-300 mb-8 leading-relaxed max-w-2xl mx-auto">
                Para consultas legales, reportes de infracción de derechos de autor, o asuntos relacionados con estos términos de servicio:
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
                  <p>Responsable legal:</p>
                  <p className="font-semibold text-white">José Ortega</p>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t border-slate-700">
                <p className="text-sm text-slate-400 mb-4">
                  Estos términos se rigen por las leyes aplicables en la jurisdicción donde opera <strong className="text-slate-300">Nawatlahtol</strong>.
                </p>
                <p className="text-xs text-slate-500">
                  Tiempo de respuesta estimado para consultas legales: 5-10 días hábiles
                </p>
              </div>
            </motion.section>
          </div>
        </div>
      </main>
    </>
  );
}