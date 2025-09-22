'use client';

import { motion } from 'framer-motion';
import { Heart, Globe, Users, BookOpen, Target, Lightbulb, Feather, Star, ArrowRight, Mail } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import JoinModal from '@/components/JoinModal';

export default function NosotrosPage() {
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  const values = [
    {
      icon: Heart,
      title: "Preservación Cultural",
      description: "Mantener viva la riqueza del náhuatl para las futuras generaciones",
      color: "red"
    },
    {
      icon: Globe,
      title: "Accesibilidad Global",
      description: "Hacer el náhuatl accesible a cualquier persona, en cualquier lugar del mundo",
      color: "blue"
    },
    {
      icon: Users,
      title: "Comunidad Inclusiva",
      description: "Crear espacios donde todos puedan aprender y contribuir",
      color: "green"
    },
    {
      icon: BookOpen,
      title: "Educación de Calidad",
      description: "Proporcionar recursos educativos rigurosos y efectivos",
      color: "purple"
    }
  ];

  const stats = [
    { number: "1000+", label: "Palabras en el diccionario", color: "blue" },
    { number: "50+", label: "Lecciones estructuradas", color: "green" },
    { number: "24/7", label: "Acceso disponible", color: "purple" },
    { number: "100%", label: "Gratuito y libre", color: "red" }
  ];

  const team = [
    {
      name: "Comunidad de Hablantes",
      role: "Guardianes del conocimiento",
      description: "Hablantes nativos que comparten su sabiduría ancestral"
    },
    {
      name: "Educadores Especializados", 
      role: "Metodología pedagógica",
      description: "Expertos en enseñanza de lenguas indígenas"
    },
    {
      name: "Desarrolladores Comprometidos",
      role: "Tecnología al servicio cultural",
      description: "Tecnólogos dedicados a la preservación digital"
    }
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 dark:bg-slate-900">
        {/* Hero Section */}
        <section className="relative pt-20 pb-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-green-600/10 dark:from-blue-400/5 dark:via-purple-400/5 dark:to-green-400/5"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center gap-3 bg-blue-100 dark:bg-blue-900/30 px-6 py-3 rounded-full mb-8">
                <Feather className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <span className="text-blue-800 dark:text-blue-200 font-medium">Sobre Nosotros</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-slate-100 mb-6">
                Construyendo puentes entre
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                  tradición y futuro
                </span>
              </h1>
              
              <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
                En <strong className="text-slate-900 dark:text-slate-100">Nahuatlajtol</strong>, creemos que la tecnología puede ser un aliado poderoso 
                para preservar y revitalizar las lenguas originarias de América.
              </p>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className={`text-3xl md:text-4xl font-bold text-${stat.color}-600 dark:text-${stat.color}-400 mb-2`}>
                    {stat.number}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="border-l-4 border-blue-600 pl-8 mb-16"
            >
              <div className="flex items-center gap-4 mb-8">
                <Target className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  Nuestra Misión
                </h2>
              </div>
              
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-slate-700 dark:text-slate-300 text-lg leading-relaxed mb-6">
                  Democratizar el acceso al aprendizaje del náhuatl mediante una plataforma digital innovadora 
                  que respeta la tradición oral mientras abraza las posibilidades de la era digital.
                </p>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-8 rounded-xl border border-blue-200 dark:border-blue-800">
                  <h3 className="text-xl font-semibold text-blue-800 dark:text-blue-200 mb-4">
                    ¿Por qué es importante?
                  </h3>
                  <div className="space-y-4 text-blue-700 dark:text-blue-300">
                    <div className="flex items-start gap-3">
                      <Star className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                      <p>El náhuatl es hablado por más de 1.7 millones de personas en México</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Star className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                      <p>Es una de las lenguas indígenas más importantes de América</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Star className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                      <p>Preserva conocimientos ancestrales y cosmovisión única</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-slate-100 dark:bg-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="flex items-center justify-center gap-4 mb-8">
                <Lightbulb className="h-8 w-8 text-green-600 dark:text-green-400" />
                <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  Nuestros Valores
                </h2>
              </div>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`w-16 h-16 rounded-full bg-${value.color}-100 dark:bg-${value.color}-900/30 flex items-center justify-center mb-6`}>
                    <value.icon className={`h-8 w-8 text-${value.color}-600 dark:text-${value.color}-400`} />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                    {value.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {value.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="border-l-4 border-green-600 pl-8 mb-16"
            >
              <div className="flex items-center gap-4 mb-8">
                <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
                <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  Nuestro Equipo
                </h2>
              </div>
              
              <p className="text-slate-700 dark:text-slate-300 text-lg leading-relaxed mb-12">
                Somos un colectivo diverso unido por la pasión de preservar y promover la lengua náhuatl. 
                Nuestro equipo combina conocimiento ancestral con innovación tecnológica.
              </p>

              <div className="grid md:grid-cols-3 gap-8">
                {team.map((member, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-green-50 dark:bg-green-900/20 p-8 rounded-xl border border-green-200 dark:border-green-800"
                  >
                    <h3 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-2">
                      {member.name}
                    </h3>
                    <p className="text-green-600 dark:text-green-400 font-medium mb-4">
                      {member.role}
                    </p>
                    <p className="text-green-700 dark:text-green-300 leading-relaxed">
                      {member.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* José Ortega Section */}
        <section className="py-20 bg-gradient-to-br from-amber-50 via-emerald-50 to-white dark:from-slate-800 dark:via-slate-700 dark:to-slate-900">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl border border-amber-200 dark:border-slate-700"
            >
              <div className="flex flex-col lg:flex-row items-center gap-12">
                {/* Profile Image */}
                <div className="relative">
                  <div className="w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-emerald-500 shadow-xl">
                    <Image 
                      src="/jose.jpeg" 
                      alt="José Ortega - Fundador de Nahuatlajtol"
                      width={224}
                      height={224}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-3 rounded-full shadow-lg">
                    <Heart className="h-6 w-6 fill-current" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 text-center lg:text-left">
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    viewport={{ once: true }}
                  >
                    <h2 className="text-3xl md:text-4xl font-bold text-emerald-800 dark:text-emerald-300 mb-3">
                      José Ortega
                    </h2>
                    <p className="text-xl text-amber-700 dark:text-amber-400 font-semibold mb-6">
                      Fundador de Nahuatlahtol
                    </p>
                    
                    <div className="prose prose-lg max-w-none text-slate-700 dark:text-slate-300 mb-8">
                      <p className="leading-relaxed">
                        Apasionado por la tecnología, la cultura y la educación. Mi sueño es que el náhuatl vuelva a 
                        escucharse en cada rincón, y que la tecnología sea el puente para lograrlo. 
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold"> Tlazocamatin</span> por 
                        ser parte de esta comunidad.
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <a
                        href="mailto:joseortegahac@gmail.com?subject=Hola José - Consulta sobre Nahuatlajtol&body=Hola José,%0D%0A%0D%0AMe pongo en contacto contigo porque:%0D%0A%0D%0A[Escribe tu mensaje aquí]%0D%0A%0D%0AGracias por tu tiempo y por crear Nahuatlajtol.%0D%0A%0D%0ASaludos,"
                        className="inline-flex items-center justify-center px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                      >
                        <Mail className="h-5 w-5 mr-2" />
                        Contáctame
                      </a>
                      
                      <button
                        onClick={() => setIsJoinModalOpen(true)}
                        className="inline-flex items-center justify-center px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                      >
                        <Users className="h-5 w-5 mr-2" />
                        Únete
                      </button>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-purple-600 to-blue-600 dark:from-purple-700 dark:to-blue-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Únete a nuestra misión
              </h2>
              <p className="text-xl text-purple-100 mb-8 leading-relaxed">
                Ayúdanos a mantener viva una de las lenguas más hermosas de América. 
                Cada palabra aprendida es un paso hacia la preservación cultural.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold hover:bg-purple-50 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl">
                  Comenzar a aprender
                  <ArrowRight className="h-5 w-5" />
                </button>
                <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-purple-600 transition-all duration-300">
                  Contribuir al proyecto
                </button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      
      {/* Join Modal */}
      <JoinModal 
        isOpen={isJoinModalOpen} 
        onClose={() => setIsJoinModalOpen(false)} 
      />
    </>
  );
}