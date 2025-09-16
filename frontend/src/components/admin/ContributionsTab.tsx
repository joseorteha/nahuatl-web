// components/admin/ContributionsTab.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, Eye, Clock, CheckCircle, XCircle, Globe, FileText } from 'lucide-react';

interface AdminContribution {
  id: string;
  word: string;
  definition: string;
  info_gramatical: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada' | 'publicada';
  fecha_creacion: string;
  fecha_revision?: string;
  razon_contribucion?: string;
  fuente?: string;
  nivel_confianza: string;
  comentarios_admin?: string;
  perfiles: {
    nombre_completo: string;
    email: string;
    username?: string;
  };
  admin_revisor?: {
    nombre_completo: string;
  };
}

interface ContributionsTabProps {
  contributions: AdminContribution[];
  onSelectContribution: (contribution: AdminContribution) => void;
}

export default function ContributionsTab({ contributions, onSelectContribution }: ContributionsTabProps) {
  const [filter, setFilter] = useState<'pendiente' | 'todas'>('pendiente');

  const getStatusBadge = (estado: string) => {
    const config = {
      pendiente: {
        icon: Clock,
        styles: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700',
        label: 'Pendiente'
      },
      aprobada: {
        icon: CheckCircle,
        styles: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700',
        label: 'Aprobada'
      },
      rechazada: {
        icon: XCircle,
        styles: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700',
        label: 'Rechazada'
      },
      publicada: {
        icon: Globe,
        styles: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700',
        label: 'Publicada'
      }
    };

    const statusConfig = config[estado as keyof typeof config] || config.pendiente;
    const Icon = statusConfig.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full border ${statusConfig.styles}`}>
        <Icon className="h-3 w-3" />
        {statusConfig.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredContributions = filter === 'pendiente' 
    ? contributions.filter(c => c.estado === 'pendiente')
    : contributions;

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-white/20 dark:border-gray-700/50 shadow-lg"
      >
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          <span className="font-medium text-gray-700 dark:text-gray-200">Filtros</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setFilter('pendiente')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              filter === 'pendiente'
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Clock className="h-4 w-4" />
            Pendientes ({contributions.filter(c => c.estado === 'pendiente').length})
          </button>
          <button
            onClick={() => setFilter('todas')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              filter === 'todas'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Globe className="h-4 w-4" />
            Todas ({contributions.length})
          </button>
        </div>
      </motion.div>

      {/* Lista de contribuciones */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-gray-700/50 overflow-hidden"
      >
        {filteredContributions.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="mb-6">
              <div className="mx-auto w-20 h-20 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                <FileText className="h-10 w-10 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              {filter === 'pendiente' ? 'No hay contribuciones pendientes' : 'No hay contribuciones'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {filter === 'pendiente' 
                ? 'Todas las contribuciones han sido revisadas.' 
                : 'No se han recibido contribuciones aún.'}
            </p>
          </motion.div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Palabra
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Contribuidor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredContributions.map((contribution, index) => (
                  <motion.tr 
                    key={contribution.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {contribution.word}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-1">
                          {contribution.definition}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {contribution.perfiles.nombre_completo}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {contribution.perfiles.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(contribution.estado)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(contribution.fecha_creacion)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => onSelectContribution(contribution)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        <Eye className="h-4 w-4" />
                        Ver Detalles
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
