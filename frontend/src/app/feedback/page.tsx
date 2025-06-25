'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { MessageSquare, Plus, ThumbsUp, Clock, CheckCircle, AlertCircle, Star, User } from 'lucide-react';
import type { Database } from '@/lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

type Feedback = Database['public']['Tables']['feedback']['Row'] & {
  profiles: Pick<Profile, 'full_name' | 'username'> | null;
  feedback_replies: Array<{
    id: string;
    content: string;
    created_at: string;
    is_admin_reply: boolean;
    profiles: Pick<Profile, 'full_name'> | null;
  }>;
  feedback_likes: Array<{
    user_id: string;
  }>;
};

interface AuthenticatedUser {
  id: string;
  full_name: string;
  email: string;
  username?: string;
}

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general' as const,
    priority: 'medium' as const
  });
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser: AuthenticatedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchFeedbacks();
    } else {
      router.push('/login');
    }
  }, [router]);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select(`
          *,
          profiles (full_name, username),
          feedback_replies (
            id,
            content,
            created_at,
            is_admin_reply,
            profiles (full_name)
          ),
          feedback_likes (user_id)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFeedbacks(data || []);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Debes iniciar sesión para enviar sugerencias.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('http://localhost:3001/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          title: formData.title,
          content: formData.content,
          category: formData.category,
          priority: formData.priority,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Error al enviar la sugerencia.');
      }

      setFormData({ title: '', content: '', category: 'general', priority: 'medium' });
      setShowForm(false);
      fetchFeedbacks();
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      alert('Hubo un error al enviar tu sugerencia: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (feedbackId: string) => {
    if (!user) {
      alert('Debes iniciar sesión para votar.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/feedback/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          feedback_id: feedbackId,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Error al procesar el voto.');
      }

      fetchFeedbacks();
    } catch (error: any) {
      console.error('Error toggling like:', error);
      alert('Hubo un error al votar: ' + error.message);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'reviewed': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'implemented': return <Star className="w-4 h-4 text-green-500" />;
      case 'declined': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-emerald-400 mb-2">Sugerencias y Feedback</h1>
            <p className="text-gray-400">Ayúdanos a mejorar Timumachtikan Nawatl con tus ideas</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            Nueva Sugerencia
          </button>
        </div>

        {showForm && (
          <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
            <h2 className="text-2xl font-bold mb-4">Nueva Sugerencia</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Título</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-emerald-500"
                  placeholder="Describe brevemente tu sugerencia"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Descripción</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-emerald-500 h-32"
                  placeholder="Explica detalladamente tu sugerencia, idea o reporte..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Categoría</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-emerald-500"
                  >
                    <option value="general">General</option>
                    <option value="suggestion">Sugerencia</option>
                    <option value="bug_report">Reporte de Error</option>
                    <option value="feature_request">Solicitud de Función</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Prioridad</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-emerald-500"
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                    <option value="critical">Crítica</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-500 rounded-lg font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-semibold disabled:bg-gray-500"
                >
                  {submitting ? 'Enviando...' : 'Enviar Sugerencia'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-6">
          {feedbacks.map((feedback) => (
            <div key={feedback.id} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-white">{feedback.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                    <span>{feedback.profiles?.full_name || 'Anónimo'}</span>
                    <span>·</span>
                    <span>{new Date(feedback.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(feedback.priority || '')}`}>
                    {feedback.priority}
                  </span>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(feedback.status || '')}
                    <span className="text-sm capitalize">{feedback.status}</span>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-gray-300">{feedback.content}</p>
              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={() => handleLike(feedback.id)}
                  className={`flex items-center gap-2 text-sm transition-colors ${
                    user && feedback.feedback_likes.some(l => l.user_id === user.id)
                      ? 'text-emerald-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <ThumbsUp size={16} />
                  {feedback.feedback_likes.length}
                </button>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <MessageSquare size={16} />
                  {feedback.feedback_replies.length}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 