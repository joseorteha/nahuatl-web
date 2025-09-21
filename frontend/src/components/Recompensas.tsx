'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthBackend } from '@/hooks/useAuthBackend';

interface RecompensasUsuario {
  puntos_totales: number;
  nivel: 'principiante' | 'contribuidor' | 'experto' | 'maestro' | 'leyenda';
  experiencia: number;
  contribuciones_aprobadas: number;
  likes_recibidos: number;
  racha_dias: number;
}

interface Logro {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  categoria: string;
  fecha_obtenido: string;
}

interface HistorialPunto {
  puntos_ganados: number;
  motivo: string;
  descripcion: string;
  fecha_creacion: string;
}

const nivelesConfig = {
  principiante: { 
    nombre: 'Principiante', 
    color: 'text-green-500', 
    bg: 'bg-green-50 border-green-200',
    puntos_necesarios: 0 
  },
  contribuidor: { 
    nombre: 'Contribuidor', 
    color: 'text-blue-500', 
    bg: 'bg-blue-50 border-blue-200',
    puntos_necesarios: 100 
  },
  experto: { 
    nombre: 'Experto', 
    color: 'text-purple-500', 
    bg: 'bg-purple-50 border-purple-200',
    puntos_necesarios: 500 
  },
  maestro: { 
    nombre: 'Maestro', 
    color: 'text-orange-500', 
    bg: 'bg-orange-50 border-orange-200',
    puntos_necesarios: 1000 
  },
  leyenda: { 
    nombre: 'Leyenda', 
    color: 'text-red-500', 
    bg: 'bg-red-50 border-red-200',
    puntos_necesarios: 2500 
  }
};

export default function Recompensas({ userId }: { userId: string }) {
  const [recompensas, setRecompensas] = useState<RecompensasUsuario | null>(null);
  const [logros, setLogros] = useState<Logro[]>([]);
  const [historial, setHistorial] = useState<HistorialPunto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'resumen' | 'logros' | 'historial'>('resumen');
  
  type TabKey = 'resumen' | 'logros' | 'historial';
  
  const { } = useAuthBackend();

  const obtenerRecompensas = useCallback(async () => {
    try {
      setLoading(true);
      
      // Obtener datos de recompensas
      const token = localStorage.getItem('auth_tokens');
      const parsedTokens = token ? JSON.parse(token) : null;
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/recompensas/usuario/${userId}`, {
        headers: {
          'Authorization': `Bearer ${parsedTokens?.accessToken}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setRecompensas(data.recompensas);
        setLogros(data.logros || []);
      }

      // Obtener historial
      const historialResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/recompensas/historial/${userId}`, {
        headers: {
          'Authorization': `Bearer ${parsedTokens?.accessToken}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (historialResponse.ok) {
        const historialData = await historialResponse.json();
        setHistorial(historialData.historial || []);
      }
      
    } catch (error) {
      console.error('Error al obtener recompensas:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    obtenerRecompensas();
  }, [obtenerRecompensas]);

  const calcularProgreso = () => {
    if (!recompensas) return { porcentaje: 0, siguienteNivel: 'contribuidor', puntosNecesarios: 100 };
    
    const nivelesOrden = ['principiante', 'contribuidor', 'experto', 'maestro', 'leyenda'];
    const indexActual = nivelesOrden.indexOf(recompensas.nivel);
    
    if (indexActual === nivelesOrden.length - 1) {
      return { porcentaje: 100, siguienteNivel: null, puntosNecesarios: 0 };
    }
    
    const siguienteNivel = nivelesOrden[indexActual + 1] as keyof typeof nivelesConfig;
    const puntosActuales = recompensas.puntos_totales;
    const puntosNivel = nivelesConfig[recompensas.nivel].puntos_necesarios;
    const puntosSiguiente = nivelesConfig[siguienteNivel].puntos_necesarios;
    
    const porcentaje = ((puntosActuales - puntosNivel) / (puntosSiguiente - puntosNivel)) * 100;
    
    return {
      porcentaje: Math.min(Math.max(porcentaje, 0), 100),
      siguienteNivel,
      puntosNecesarios: puntosSiguiente - puntosActuales
    };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!recompensas) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <p className="text-gray-500">No se pudieron cargar las recompensas</p>
      </div>
    );
  }

  const nivelConfig = nivelesConfig[recompensas.nivel];
  const progreso = calcularProgreso();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header con nivel y puntos */}
      <div className={`${nivelConfig.bg} border-b-2 p-6`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Sistema de Recompensas</h3>
            <div className="flex items-center mt-2">
              <span className={`${nivelConfig.color} font-bold text-xl mr-2`}>
                {nivelConfig.nombre}
              </span>
              <span className="text-gray-600">
                {recompensas.puntos_totales} puntos
              </span>
            </div>
          </div>
          
          {/* Badge de racha */}
          {recompensas.racha_dias > 0 && (
            <div className="text-center">
              <div className="text-2xl">🔥</div>
              <div className="text-sm font-semibold text-gray-700">
                {recompensas.racha_dias} días
              </div>
            </div>
          )}
        </div>

        {/* Barra de progreso */}
        {progreso.siguienteNivel && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progreso hacia {nivelesConfig[progreso.siguienteNivel as keyof typeof nivelesConfig].nombre}</span>
              <span>{progreso.puntosNecesarios} puntos restantes</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progreso.porcentaje}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex">
          {[
            { key: 'resumen', label: 'Resumen', icon: '📊' },
            { key: 'logros', label: 'Logros', icon: '🏆' },
            { key: 'historial', label: 'Historial', icon: '📜' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabKey)}
              className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenido de tabs */}
      <div className="p-6">
        {activeTab === 'resumen' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div key="contribuciones" className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{recompensas.contribuciones_aprobadas}</div>
              <div className="text-sm text-gray-600">Contribuciones</div>
            </div>
            <div key="likes" className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{recompensas.likes_recibidos}</div>
              <div className="text-sm text-gray-600">Likes Recibidos</div>
            </div>
            <div key="logros" className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{logros.length}</div>
              <div className="text-sm text-gray-600">Logros Obtenidos</div>
            </div>
          </div>
        )}

        {activeTab === 'logros' && (
          <div className="space-y-3">
            {logros.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Aún no has obtenido logros. ¡Empieza a contribuir!</p>
            ) : (
              logros.map((logro) => (
                <div key={logro.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-2xl mr-3">{logro.icono}</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{logro.nombre}</h4>
                    <p className="text-sm text-gray-600">{logro.descripcion}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">
                      {new Date(logro.fecha_obtenido).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'historial' && (
          <div className="space-y-3">
            {historial.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No hay historial de puntos disponible</p>
            ) : (
              historial.map((entrada, index) => (
                <div key={`${entrada.fecha_creacion}-${entrada.puntos_ganados}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-800">{entrada.motivo}</h4>
                    {entrada.descripcion && (
                      <p className="text-sm text-gray-600">{entrada.descripcion}</p>
                    )}
                    <div className="text-xs text-gray-500">
                      {new Date(entrada.fecha_creacion).toLocaleString()}
                    </div>
                  </div>
                  <div className={`font-bold ${entrada.puntos_ganados > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {entrada.puntos_ganados > 0 ? '+' : ''}{entrada.puntos_ganados}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
