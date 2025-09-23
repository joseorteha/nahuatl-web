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
        styles: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-300 border-cyan-200 dark:border-cyan-700',
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
        className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl p-4 border border-slate-200/60 dark:border-slate-700/60 shadow-lg"
      >
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-5 w-5 text-slate-600 dark:text-slate-300" />
          <span className="font-medium text-slate-700 dark:text-slate-200">Filtros</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setFilter('pendiente')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              filter === 'pendiente'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            <Clock className="h-4 w-4" />
            Pendientes ({contributions.filter(c => c.estado === 'pendiente').length})
          </button>
          <button
            onClick={() => setFilter('todas')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              filter === 'todas'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
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
        className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200/60 dark:border-slate-700/60 overflow-hidden"
      >
        {filteredContributions.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="mb-6">
              <div className="mx-auto w-20 h-20 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                <FileText className="h-10 w-10 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
              {filter === 'pendiente' ? 'No hay contribuciones pendientes' : 'No hay contribuciones'}
            </h3>
            <p className="text-slate-600 dark:text-slate-300">
              {filter === 'pendiente' 
                ? 'Todas las contribuciones han sido revisadas.' 
                : 'No se han recibido contribuciones aún.'}
            </p>
          </motion.div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Palabra
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Contribuidor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
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
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">
                          {contribution.word}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-300 line-clamp-1">
                          {contribution.definition}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {contribution.perfiles.nombre_completo}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
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
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
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
