import { Construction } from 'lucide-react';
import Link from 'next/link';

export default function ComingSoon() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-4">
      <Construction className="h-16 w-16 text-amber-500 mb-6" />
      <h1 className="text-3xl font-bold text-neutral-800 mb-3">¡Próximamente!</h1>
      <p className="text-base text-neutral-600 max-w-lg mb-8">
        Estamos trabajando arduamente en esta sección. ¡Regresa pronto para descubrir nuevas lecciones interactivas y ejercicios para potenciar tu aprendizaje!
      </p>
      <Link href="/diccionario">
        <div className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-2.5 px-5 rounded-md transition-colors duration-200">
          Explorar el Diccionario
        </div>
      </Link>
    </div>
  );
}
