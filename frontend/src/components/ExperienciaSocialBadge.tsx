'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp } from 'lucide-react';

interface ExperienciaSocialBadgeProps {
  userId: string;
  className?: string;
}

export default function ExperienciaSocialBadge({ userId, className = '' }: ExperienciaSocialBadgeProps) {
  const [experienciaSocial, setExperienciaSocial] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExperienciaSocial();
  }, [userId]);

  const fetchExperienciaSocial = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/experiencia-social/${userId}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setExperienciaSocial(result.data.experienciaSocial);
        }
      }
    } catch (error) {
      console.error('Error fetching experiencia social:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNivelInfo = (exp: number) => {
    if (exp >= 1000) return { color: 'from-purple-600 to-pink-600', icon: '👑' };
    if (exp >= 500) return { color: 'from-blue-600 to-purple-600', icon: '🏆' };
    if (exp >= 200) return { color: 'from-green-600 to-blue-600', icon: '⭐' };
    if (exp >= 50) return { color: 'from-yellow-600 to-green-600', icon: '🌟' };
    return { color: 'from-gray-600 to-yellow-600', icon: '🌱' };
  };

  if (loading) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full ${className}`}>
        <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
        <div className="w-12 h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
      </div>
    );
  }

  if (experienciaSocial === null) {
    return null;
  }

  const nivelInfo = getNivelInfo(experienciaSocial);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r ${nivelInfo.color} text-white rounded-full shadow-lg ${className}`}
    >
      <Trophy className="w-4 h-4" />
      <span className="text-sm font-semibold">
        {experienciaSocial} exp
      </span>
      <span className="text-xs opacity-90">
        {nivelInfo.icon}
      </span>
    </motion.div>
  );
}
