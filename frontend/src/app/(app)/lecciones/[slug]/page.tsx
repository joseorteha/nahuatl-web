import ComingSoon from '@/components/ComingSoon';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, BookText, Mic } from 'lucide-react';

// --- Tipos de Datos ---
interface VocabularyItem {
  nahuatl: string;
  espanol: string;
}

interface LessonContent {
  type: 'paragraph' | 'subheading' | 'vocabulary';
  text?: string;
  items?: VocabularyItem[];
}

interface Lesson {
  id: number;
  slug: string;
  title: string;
  description: string;
  content: LessonContent[];
}

// --- Obtención de Datos ---
async function getLesson(slug: string): Promise<Lesson> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const res = await fetch(`${apiUrl}/api/lessons/${slug}`, { cache: 'no-store' });
    if (!res.ok) {
      if (res.status === 404) notFound(); // Si la API devuelve 404, mostramos la página de error de Next.js
      throw new Error('Failed to fetch lesson');
    }
    return res.json();
  } catch (error) {
    console.error('API connection error:', error);
    throw new Error('Could not connect to the server to get the lesson.');
  }
}

// --- Componente para Renderizar Contenido ---
function ContentRenderer({ content }: { content: LessonContent }) {
  switch (content.type) {
    case 'paragraph':
      return <p className="text-gray-300 leading-relaxed text-lg mb-6">{content.text}</p>;
    case 'subheading':
      return <h2 className="text-2xl font-bold text-emerald-300 mt-8 mb-4">{content.text}</h2>;
    case 'vocabulary':
      return (
        <div className="my-6 bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="p-4 text-lg font-semibold text-gray-200">Náhuatl</th>
                <th className="p-4 text-lg font-semibold text-gray-200">Español</th>
              </tr>
            </thead>
            <tbody>
              {content.items?.map((item, index) => (
                <tr key={index} className="border-t border-gray-700 hover:bg-gray-700/40 transition-colors">
                  <td className="p-4 text-gray-200 font-medium">{item.nahuatl}</td>
                  <td className="p-4 text-gray-400">{item.espanol}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    default:
      return null;
  }
}

// --- Página Principal de la Lección ---
export default async function LessonPage({ params }: { params: { slug: string } }) {
  if (process.env.NEXT_PUBLIC_LAUNCH_MODE === 'preview') {
    return <ComingSoon />;
  }

  const lesson = await getLesson(params.slug);

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <header className="mb-10">
          <Link href="/lecciones" className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors mb-6">
            <ArrowLeft size={20} />
            <span>Volver a todas las lecciones</span>
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">{lesson.title}</h1>
          <p className="text-xl text-gray-400">{lesson.description}</p>
        </header>

        <article>
          {lesson.content.map((contentBlock, index) => (
            <ContentRenderer key={index} content={contentBlock} />
          ))}
        </article>
      </div>
    </div>
  );
}
