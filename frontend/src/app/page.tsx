import Link from 'next/link';
import { Book, GraduationCap, Sword, MessageSquare, BadgeCheck } from 'lucide-react';

export default function Home() {
  const isPreviewMode = process.env.NEXT_PUBLIC_LAUNCH_MODE === 'preview';

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8 font-sans">
      <header className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <h1 className="text-5xl md:text-6xl font-extrabold text-emerald-400 tracking-tight">
            Timumachtikan Nawatl
          </h1>
          {isPreviewMode && (
            <div className="bg-amber-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
              <BadgeCheck size={16} />
              BETA
            </div>
          )}
        </div>
        <p className="text-xl md:text-2xl text-gray-300 mt-4 max-w-2xl">
          (Aprendamos Náhuatl)
        </p>
        <p className="text-lg text-gray-400 mt-6 max-w-3xl">
          Una plataforma interactiva para explorar, aprender y practicar el náhuatl de la Sierra de Zongolica, Veracruz.
        </p>
        
        {isPreviewMode && (
          <div className="mt-8 p-6 bg-amber-900/20 border border-amber-500/30 rounded-lg max-w-2xl">
            <h2 className="text-xl font-bold text-amber-400 mb-3">🚀 Versión Beta</h2>
            <p className="text-amber-200 mb-4">
              Actualmente estamos en fase beta. Solo el <strong>Diccionario</strong> está disponible para pruebas.
              Las funciones de Lecciones y Práctica estarán disponibles próximamente.
            </p>
            <p className="text-amber-200">
              ¡Tu feedback es invaluable! Comparte tus sugerencias para ayudarnos a mejorar la aplicación.
            </p>
          </div>
        )}
      </header>

      <main className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        <FeatureCard
          href="/diccionario"
          icon={<Book size={40} />}
          title="Diccionario Inteligente"
          description="Busca palabras en náhuatl o español con un motor de búsqueda avanzado que entiende el contexto."
          available={true}
        />
        
        <FeatureCard
          href="/feedback"
          icon={<MessageSquare size={40} />}
          title="Sugerencias y Feedback"
          description="Comparte tus ideas, reporta errores o solicita nuevas funciones para mejorar la aplicación."
          available={true}
        />
        
        {!isPreviewMode ? (
          <>
            <FeatureCard
              href="/lecciones"
              icon={<GraduationCap size={40} />}
              title="Lecciones Estructuradas"
              description="Aprende gramática, vocabulario y frases comunes a través de lecciones claras y progresivas."
              available={true}
            />
            <FeatureCard
              href="/practica"
              icon={<Sword size={40} />}
              title="Práctica Interactiva"
              description="Pon a prueba tus conocimientos con ejercicios dinámicos y refuerza tu aprendizaje."
              available={true}
            />
          </>
        ) : (
          <>
            <FeatureCard
              href="#"
              icon={<GraduationCap size={40} />}
              title="Lecciones Estructuradas"
              description="Próximamente: Aprende gramática, vocabulario y frases comunes a través de lecciones claras."
              available={false}
            />
            <FeatureCard
              href="#"
              icon={<Sword size={40} />}
              title="Práctica Interactiva"
              description="Próximamente: Pon a prueba tus conocimientos con ejercicios dinámicos y refuerza tu aprendizaje."
              available={false}
            />
          </>
        )}
      </main>

      <footer className="text-center mt-16 text-gray-500">
        <p>Desarrollado con pasión para la preservación y difusión de la cultura náhuatl.</p>
        {isPreviewMode && (
          <p className="mt-2 text-sm text-amber-400">
            Versión Beta - En desarrollo activo
          </p>
        )}
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  available: boolean;
}

function FeatureCard({ href, icon, title, description, available }: FeatureCardProps) {
  const cardContent = (
    <div className={`p-8 rounded-2xl border h-full flex flex-col items-center text-center transition-all duration-300 ${
      available 
        ? 'bg-gray-800/50 border-gray-700 hover:border-emerald-500/70 hover:shadow-emerald-500/10 hover:-translate-y-2' 
        : 'bg-gray-800/20 border-gray-600 opacity-60 cursor-not-allowed'
    }`}>
      <div className={`mb-4 ${available ? 'text-emerald-400' : 'text-gray-500'}`}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-gray-100 mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
      {!available && (
        <div className="mt-4 text-amber-400 text-sm font-semibold">
          Próximamente
        </div>
      )}
    </div>
  );

  if (available) {
    return <Link href={href}>{cardContent}</Link>;
  }

  return cardContent;
}
