import ComingSoon from '@/components/ComingSoon';
import Link from 'next/link';
import { GraduationCap, AlertTriangle } from 'lucide-react';

interface Lesson {
  id: number;
  slug: string;
  title: string;
  description: string;
}

async function getLessons(): Promise<Lesson[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const res = await fetch(`${apiUrl}/api/lessons`, { cache: 'no-store' });
    if (!res.ok) {
      console.error('Failed to fetch lessons:', res.status, res.statusText);
      return []; // Devuelve un array vacío en caso de error para no romper la página
    }
    return res.json();
  } catch (error) {
    console.error('Error connecting to the API:', error);
    return []; // Devuelve un array vacío si la API no está disponible
  }
}

export default async function LessonsPage() {
  if (process.env.NEXT_PUBLIC_LAUNCH_MODE === 'preview') {
    return <ComingSoon />;
  }

  const lessons = await getLessons();

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-emerald-400">Lecciones de Náhuatl</h1>
          <p className="text-gray-400 mt-3 max-w-2xl mx-auto">Comienza tu viaje de aprendizaje con nuestras lecciones estructuradas, desde lo básico hasta temas más avanzados.</p>
        </header>

        {lessons.length > 0 ? (
          <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {lessons.map((lesson) => (
              <Link key={lesson.id} href={`/lecciones/${lesson.slug}`}>
                <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700 h-full flex flex-col text-left transition-all duration-300 hover:border-emerald-500/70 hover:shadow-emerald-500/10 hover:-translate-y-1">
                  <div className="text-emerald-400 mb-4">
                    <GraduationCap size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-100 mb-3">{lesson.title}</h2>
                  <p className="text-gray-400 leading-relaxed flex-grow">{lesson.description}</p>
                  <div className="mt-6 text-emerald-400 font-semibold">Ver lección →</div>
                </div>
              </Link>
            ))}
          </main>
        ) : (
          <div className="text-center text-gray-500 mt-16 flex flex-col items-center">
            <AlertTriangle size={64} className="mb-4 text-amber-500" />
            <h2 className="text-2xl font-semibold text-gray-300">No se pudieron cargar las lecciones</h2>
            <p className="mt-2 max-w-md">Parece que hay un problema de conexión con el servidor. Por favor, asegúrate de que el backend esté funcionando.</p>
          </div>
        )}
      </div>
    </div>
  );
}


