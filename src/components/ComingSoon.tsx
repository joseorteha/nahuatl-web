import { HardHat } from 'lucide-react';
import Link from 'next/link';

export default function ComingSoon() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center text-white p-4">
      <HardHat className="h-24 w-24 text-amber-400 mb-6" />
      <h1 className="text-4xl font-bold text-emerald-400 mb-3">¡Próximamente!</h1>
      <p className="text-lg text-gray-300 max-w-lg mb-8">
        Estamos trabajando arduamente en esta sección. ¡Regresa pronto para descubrir nuevas lecciones interactivas y ejercicios para potenciar tu aprendizaje!
      </p>
      <Link href="/diccionario">
        <div className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-lg transition-colors">
          Explorar el Diccionario
        </div>
      </Link>
    </div>
  );
}
