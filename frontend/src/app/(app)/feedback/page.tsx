'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { MessageSquare, Plus, ThumbsUp, Clock, CheckCircle, AlertCircle, Star, User } from 'lucide-react';
import type { Database } from '@/lib/database.types';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

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
  is_admin: boolean;
}

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: 'suggestion',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser: AuthenticatedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchFeedbacks();
    } else {
      router.push('/login');
    }
    setMounted(true);
  }, [router]);

  const fetchFeedbacks = async () => {
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
    } catch (error: unknown) {
      console.error('Error fetching feedbacks:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    if (!user) {
      setSubmitStatus('error');
      alert('Debes iniciar sesión para enviar feedback.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          title: formData.subject,
          content: formData.message,
          category: formData.type, // o 'general' si no usas el select
          // priority: 'medium', // puedes agregarlo si quieres
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Error al enviar feedback.');
      }

      setSubmitStatus('success');
      setFormData({ name: '', email: '', type: 'suggestion', subject: '', message: '' });
      fetchFeedbacks(); // refresca la lista
    } catch (error: unknown) {
      setSubmitStatus('error');
      alert('Hubo un error al enviar el feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
    } catch (error: unknown) {
      console.error('Error toggling like:', error);
      alert('Hubo un error al votar: ' + (error instanceof Error ? error.message : ''));
    }
  };

  const handleReply = async (feedbackId: string) => {
    if (!user) {
      alert('Debes iniciar sesión para responder.');
      return;
    }
    if (!replyContent.trim()) return;
    try {
      const response = await fetch('http://localhost:3001/api/feedback/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          feedback_id: feedbackId,
          content: replyContent,
        }),
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Error al responder.');
      }
      setReplyContent('');
      setReplyingTo(null);
      fetchFeedbacks();
    } catch (error: unknown) {
      alert('Hubo un error al responder: ' + (error instanceof Error ? error.message : ''));
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

  // Verifica si el usuario es admin
  const isAdmin = user?.is_admin;

  // Editar feedback principal
  const handleEditFeedback = async (id: string) => {
    if (!editContent.trim()) return;
    try {
      const response = await fetch(`http://localhost:3001/api/feedback/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user?.id, content: editContent }),
      });
      if (!response.ok) throw new Error('Error al editar comentario.');
      setEditingId(null);
      setEditContent('');
      fetchFeedbacks();
    } catch (e) {
      alert('No se pudo editar el comentario.');
    }
  };

  // Eliminar feedback principal
  const handleDeleteFeedback = async (id: string) => {
    if (!window.confirm('¿Seguro que quieres eliminar este comentario?')) return;
    try {
      const response = await fetch(`http://localhost:3001/api/feedback/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user?.id }),
      });
      if (!response.ok) throw new Error('Error al eliminar comentario.');
      fetchFeedbacks();
    } catch (e) {
      alert('No se pudo eliminar el comentario.');
    }
  };

  // Editar reply
  const handleEditReply = async (id: string) => {
    if (!editContent.trim()) return;
    try {
      const response = await fetch(`http://localhost:3001/api/feedback/reply/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user?.id, content: editContent }),
      });
      if (!response.ok) throw new Error('Error al editar respuesta.');
      setEditingId(null);
      setEditContent('');
      fetchFeedbacks();
    } catch (e) {
      alert('No se pudo editar la respuesta.');
    }
  };

  // Eliminar reply
  const handleDeleteReply = async (id: string) => {
    if (!window.confirm('¿Seguro que quieres eliminar esta respuesta?')) return;
    try {
      const response = await fetch(`http://localhost:3001/api/feedback/reply/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user?.id }),
      });
      if (!response.ok) throw new Error('Error al eliminar respuesta.');
      fetchFeedbacks();
    } catch (e) {
      alert('No se pudo eliminar la respuesta.');
    }
  };

  if (!mounted) {
    return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center text-gray-400">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Foro de la Comunidad
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comparte tus ideas, reporta errores, sugiere mejoras y conversa con otros usuarios. ¡Tu voz ayuda a mejorar Nawatlajtol!
          </p>
        </div>

        {/* Success/Error Messages */}
        {submitStatus === 'success' && (
          <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-2xl">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-green-800">¡Gracias por tu feedback!</h3>
                <p className="text-green-700">Hemos recibido tu mensaje y lo revisaremos pronto.</p>
              </div>
            </div>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-2xl">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-red-800">Error al enviar</h3>
                <p className="text-red-700">Hubo un problema al enviar tu mensaje. Por favor, inténtalo de nuevo.</p>
              </div>
            </div>
          </div>
        )}

        {/* Formulario de nuevo comentario */}
        <div className="mb-10 bg-white rounded-2xl shadow-lg p-6 border border-[#F5F6FA]">
          <h2 className="text-lg font-bold text-[#2C3E50] mb-2">Deja tu comentario o sugerencia</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-4 items-center">
              <div className="w-10 h-10 rounded-full bg-[#5DADE2] flex items-center justify-center text-white font-bold text-lg">
                {user?.full_name?.[0] || 'U'}
              </div>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className="flex-1 px-4 py-2 rounded-lg border border-[#2ECC71]/30 bg-[#F5F6FA] focus:outline-none focus:border-[#2ECC71] text-[#2C3E50]"
                placeholder="Título o resumen breve"
                required
              />
            </div>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-lg border border-[#5DADE2]/30 bg-[#F5F6FA] focus:outline-none focus:border-[#2ECC71] text-[#2C3E50]"
              placeholder="Escribe tu comentario, sugerencia o pregunta..."
              rows={3}
              required
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-[#2ECC71] text-white rounded-lg font-semibold hover:bg-[#27ae60] transition-colors disabled:bg-gray-300"
              >
                {isSubmitting ? 'Enviando...' : 'Publicar'}
              </button>
            </div>
          </form>
        </div>

        {/* Muro de comentarios */}
        <div className="space-y-8">
          {feedbacks.length === 0 && (
            <div className="text-center text-gray-400">Aún no hay comentarios. ¡Sé el primero en participar!</div>
          )}
          {feedbacks.map((fb) => (
            <div key={fb.id} className="bg-white rounded-2xl shadow-md p-6 border border-[#F5F6FA]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-[#5DADE2] flex items-center justify-center text-white font-bold text-lg">
                  {fb.profiles?.full_name?.[0] || 'U'}
                </div>
                <div>
                  <div className="font-semibold text-[#2C3E50]">{fb.profiles?.full_name || 'Usuario'}</div>
                  <div className="text-xs text-gray-400">{formatDistanceToNow(new Date(fb.created_at), { addSuffix: true, locale: es })}</div>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <button
                    onClick={() => handleLike(fb.id)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold transition-colors ${fb.feedback_likes.some(l => l.user_id === user?.id) ? 'bg-[#2ECC71] text-white' : 'bg-gray-100 text-[#2C3E50]'}`}
                  >
                    <ThumbsUp size={16} /> {fb.feedback_likes.length}
                  </button>
                </div>
              </div>
              {editingId === fb.id ? (
                <div className="mb-2">
                  <textarea
                    className="w-full px-4 py-2 rounded-lg border border-[#2ECC71]/30 bg-[#F5F6FA] focus:outline-none focus:border-[#2ECC71] text-[#2C3E50] mb-2"
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditFeedback(fb.id)}
                      className="px-4 py-1 bg-[#2ECC71] text-white rounded-lg font-semibold hover:bg-[#27ae60] transition-colors"
                    >Guardar</button>
                    <button
                      onClick={() => { setEditingId(null); setEditContent(''); }}
                      className="px-4 py-1 bg-gray-200 text-[#2C3E50] rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    >Cancelar</button>
                  </div>
                </div>
              ) : (
                <div className="mb-2">
                  <div className="font-bold text-lg text-[#2C3E50]">{fb.title || fb.subject}</div>
                  <div className="text-[#2C3E50] mt-1 whitespace-pre-line">{fb.content || fb.message}</div>
                  {(user?.id === fb.user_id || isAdmin) && (
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => { setEditingId(fb.id); setEditContent(fb.content || fb.message || ''); }}
                        className="text-[#5DADE2] hover:underline text-xs font-semibold"
                      >Editar</button>
                      <button
                        onClick={() => handleDeleteFeedback(fb.id)}
                        className="text-[#E74C3C] hover:underline text-xs font-semibold"
                      >Eliminar</button>
                    </div>
                  )}
                </div>
              )}
              {/* Respuestas */}
              <div className="mt-4 space-y-3">
                {fb.feedback_replies?.map((reply) => (
                  <div key={reply.id} className="flex items-start gap-2 ml-8">
                    <div className="w-8 h-8 rounded-full bg-[#2ECC71] flex items-center justify-center text-white font-bold text-sm mt-1">
                      {reply.profiles?.full_name?.[0] || 'A'}
                    </div>
                    <div>
                      <div className="font-semibold text-[#2C3E50]">{reply.profiles?.full_name || 'Admin'}</div>
                      <div className="text-xs text-gray-400">{formatDistanceToNow(new Date(reply.created_at), { addSuffix: true, locale: es })}</div>
                      {editingId === reply.id ? (
                        <div className="w-full">
                          <textarea
                            className="w-full px-3 py-2 rounded-lg border border-[#2ECC71]/30 bg-[#F5F6FA] focus:outline-none focus:border-[#2ECC71] text-[#2C3E50] mb-2"
                            value={editContent}
                            onChange={e => setEditContent(e.target.value)}
                            rows={2}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditReply(reply.id)}
                              className="px-4 py-1 bg-[#2ECC71] text-white rounded-lg font-semibold hover:bg-[#27ae60] transition-colors"
                            >Guardar</button>
                            <button
                              onClick={() => { setEditingId(null); setEditContent(''); }}
                              className="px-4 py-1 bg-gray-200 text-[#2C3E50] rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                            >Cancelar</button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-[#2C3E50] mt-1 whitespace-pre-line">{reply.content}</div>
                          {(user?.id === reply.profiles?.id || isAdmin) && (
                            <div className="flex gap-2 mt-1">
                              <button
                                onClick={() => { setEditingId(reply.id); setEditContent(reply.content); }}
                                className="text-[#5DADE2] hover:underline text-xs font-semibold"
                              >Editar</button>
                              <button
                                onClick={() => handleDeleteReply(reply.id)}
                                className="text-[#E74C3C] hover:underline text-xs font-semibold"
                              >Eliminar</button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {/* Formulario de respuesta */}
                {replyingTo === fb.id ? (
                  <div className="ml-8 mt-2">
                    <textarea
                      className="w-full px-3 py-2 rounded-lg border border-[#5DADE2]/30 bg-[#F5F6FA] focus:outline-none focus:border-[#2ECC71] text-[#2C3E50] mb-2"
                      placeholder="Escribe tu respuesta..."
                      value={replyContent}
                      onChange={e => setReplyContent(e.target.value)}
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReply(fb.id)}
                        className="px-4 py-1 bg-[#2ECC71] text-white rounded-lg font-semibold hover:bg-[#27ae60] transition-colors"
                      >
                        Responder
                      </button>
                      <button
                        onClick={() => { setReplyingTo(null); setReplyContent(''); }}
                        className="px-4 py-1 bg-gray-200 text-[#2C3E50] rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setReplyingTo(fb.id)}
                    className="ml-8 mt-2 text-[#5DADE2] hover:underline text-sm font-semibold"
                  >
                    Responder
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 