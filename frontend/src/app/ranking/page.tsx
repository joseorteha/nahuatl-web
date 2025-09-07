import Header from '@/components/Header';
import RankingRecompensas from '@/components/RankingRecompensas';

export default function RankingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header de la página */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              🏆 Ranking de Contribuidores
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Conoce a los miembros más activos de nuestra comunidad que están ayudando 
              a preservar y compartir el náhuatl con el mundo.
            </p>
          </div>

          {/* Componente de ranking */}
          <RankingRecompensas />

          {/* Información adicional */}
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">🎯</span>
                ¿Cómo ganar puntos?
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Contribuir con nuevas palabras al diccionario
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Enviar feedback y sugerencias
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  Recibir likes en tus contribuciones
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                  Mantener una racha de contribuciones
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">🏅</span>
                Niveles disponibles
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <span className="mr-2">🌱</span>
                    Principiante
                  </span>
                  <span className="text-sm text-gray-500">0+ puntos</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <span className="mr-2">📚</span>
                    Contribuidor
                  </span>
                  <span className="text-sm text-gray-500">100+ puntos</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <span className="mr-2">🎓</span>
                    Experto
                  </span>
                  <span className="text-sm text-gray-500">500+ puntos</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <span className="mr-2">👑</span>
                    Maestro
                  </span>
                  <span className="text-sm text-gray-500">1000+ puntos</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <span className="mr-2">⭐</span>
                    Leyenda
                  </span>
                  <span className="text-sm text-gray-500">2500+ puntos</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
