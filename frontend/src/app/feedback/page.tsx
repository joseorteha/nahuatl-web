'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ThumbsUp, MessageCircle, Send, Edit, Trash2, ChevronDown, X, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Feedback {
  id: string;
  title: string;
  content: string;
  category: string;
  status: string;
  priority: string;
  likes_count: number;
  created_at: string;
  user_id: string;
  profiles?: {
    full_name: string;
    username?: string;
  };
  feedback_replies?: Array<{
    id: string;
    content: string;
    created_at: string;
    is_admin_reply: boolean;
    profiles?: {
      full_name: string;
    };
  }>;
  feedback_likes?: Array<{
    user_id: string;
  }>;
}

interface AuthenticatedUser {
  id: string;
  full_name: string;
  email: string;
  username?: string;
  is_admin?: boolean;
}

// Helper function para manejar fechas de forma segura
const formatSafeDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'Fecha no disponible';
  
  try {
    const date = new Date(dateString);
    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
      return 'Fecha inválida';
    }
    return formatDistanceToNow(date, { addSuffix: true, locale: es });
  } catch (error) {
    console.error('Error formatting date:', dateString, error);
    return 'Fecha inválida';
  }
};

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    type: 'suggestion'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [expandedFeedback, setExpandedFeedback] = useState<string | null>(null);
  const router = useRouter();

  const fetchFeedbacks = useCallback(async () => {
    try {
      console.log('Fetching feedbacks...');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://nahuatl-web.onrender.com'}/api/feedback`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', response.status, errorText);
        throw new Error(`Error fetching feedbacks: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Feedbacks fetched successfully:', data?.length || 0, 'items');
      setFeedbacks(data || []);
    } catch (error: unknown) {
      console.error('Error fetching feedbacks:', error);
      // No mostrar alerta aquí para evitar spam, solo log
    }
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser: AuthenticatedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchFeedbacks();
    } else {
      router.push('/login');
    }
  }, [router, fetchFeedbacks]);

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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://nahuatl-web.onrender.com'}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          title: formData.subject,
          content: formData.message,
          category: formData.type,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Error al enviar feedback.');
      }

      setSubmitStatus('success');
      setFormData({ subject: '', message: '', type: 'suggestion' });
      fetchFeedbacks();
    } catch (error: unknown) {
      console.error('Error submitting feedback:', error);
      setSubmitStatus('error');
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://nahuatl-web.onrender.com'}/api/feedback/like`, {
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
    }
  };

  const handleReply = async (feedbackId: string) => {
    if (!user) {
      alert('Debes iniciar sesión para responder.');
      return;
    }
    if (!replyContent.trim()) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://nahuatl-web.onrender.com'}/api/feedback/reply`, {
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
      console.error('Error replying:', error);
    }
  };

  const handleEditFeedback = async (id: string) => {
    if (!editContent.trim()) return;
    try {
      const response = await fetch(`https://nahuatl-web.onrender.com/api/feedback/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user!.id,
          content: editContent,
          title: editContent.split('\n')[0] || editContent,
        }),
      });
      if (!response.ok) {
        const result = await response.json();
        if (response.status === 404) {
          alert('El feedback no fue encontrado. Puede que haya sido eliminado.');
          fetchFeedbacks(); // Recargar la lista
          return;
        }
        throw new Error(result.error || 'Error al editar.');
      }
      setEditContent('');
      setEditingId(null);
      fetchFeedbacks();
    } catch (error: unknown) {
      console.error('Error editing feedback:', error);
      alert(error instanceof Error ? error.message : 'Error al editar feedback');
    }
  };

  const handleDeleteFeedback = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este feedback?')) return;
    try {
      const response = await fetch(`https://nahuatl-web.onrender.com/api/feedback/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user!.id,
        }),
      });
      if (!response.ok) {
        const result = await response.json();
        if (response.status === 404) {
          alert('El feedback no fue encontrado. Puede que ya haya sido eliminado.');
          fetchFeedbacks(); // Recargar la lista
          return;
        }
        throw new Error(result.error || 'Error al eliminar.');
      }
      fetchFeedbacks();
    } catch (error: unknown) {
      console.error('Error deleting feedback:', error);
      alert(error instanceof Error ? error.message : 'Error al eliminar feedback');
    }
  };

  const handleEditReply = async (id: string) => {
    if (!editContent.trim()) return;
    try {
      const response = await fetch(`https://nahuatl-web.onrender.com/api/feedback/reply/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user!.id,
          content: editContent,
        }),
      });
      if (!response.ok) {
        const result = await response.json();
        if (response.status === 404) {
          alert('La respuesta no fue encontrada. Puede que haya sido eliminada.');
          fetchFeedbacks(); // Recargar la lista
          return;
        }
        throw new Error(result.error || 'Error al editar respuesta.');
      }
      setEditContent('');
      setEditingId(null);
      fetchFeedbacks();
    } catch (error: unknown) {
      console.error('Error editing reply:', error);
      alert(error instanceof Error ? error.message : 'Error al editar respuesta');
    }
  };

  const handleDeleteReply = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta respuesta?')) return;
    try {
      const response = await fetch(`https://nahuatl-web.onrender.com/api/feedback/reply/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user!.id,
        }),
      });
      if (!response.ok) {
        const result = await response.json();
        if (response.status === 404) {
          alert('La respuesta no fue encontrada. Puede que ya haya sido eliminada.');
          fetchFeedbacks(); // Recargar la lista
          return;
        }
        throw new Error(result.error || 'Error al eliminar respuesta.');
      }
      fetchFeedbacks();
    } catch (error: unknown) {
      console.error('Error deleting reply:', error);
      alert(error instanceof Error ? error.message : 'Error al eliminar respuesta');
    }
  };

  const toggleFeedbackExpansion = (id: string) => {
    setExpandedFeedback(expandedFeedback === id ? null : id);
  };

  const canEditFeedback = (feedback: Feedback) => {
    return user && (user.id === feedback.user_id || user.is_admin);
  };

  // Type guard para reply con user_id
  function hasUserId(reply: { [key: string]: unknown }): reply is { user_id: string } {
    return typeof reply.user_id === 'string';
  }

  const canEditReply = (reply: { user_id?: string; id: string }) => {
    return user && hasUserId(reply) && (user.id === reply.user_id || user.is_admin);
  };

  if (!user) {
    return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
      <div className="animate-pulse text-gray-400">Cargando...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 max-w-4xl py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Tlahtolnamiquiliztli
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Espacio comunitario para compartir ideas y sugerencias
          </p>
        </div>

        {/* Status Messages */}
        {submitStatus === 'success' && (
          <div className="mb-8 p-6 bg-green-50 rounded-xl border border-green-200 shadow-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-green-800">¡Tlazocamati! (¡Gracias!)</h3>
                <p className="text-green-700">Tu mensaje ha sido enviado y será revisado pronto.</p>
              </div>
            </div>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="mb-8 p-6 bg-red-50 rounded-xl border border-red-200 shadow-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-red-800">Ahtle tlenon (Algo salió mal)</h3>
                <p className="text-red-700">No pudimos enviar tu mensaje. Por favor, inténtalo de nuevo.</p>
              </div>
            </div>
          </div>
        )}

        {/* New Feedback Form */}
        <div className="mb-10 bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Titlaniliztli (Tu opinión)</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg">
                {user?.full_name?.[0] || 'U'}
              </div>
              <div className="flex-1 w-full">
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-gray-800"
                  placeholder="Título de tu mensaje"
                  required
                />
              </div>
            </div>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-gray-800"
              placeholder="Escribe tu comentario, sugerencia o pregunta..."
              rows={4}
              required
            />
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full sm:w-auto px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-gray-800 text-sm"
              >
                <option value="suggestion">Sugerencia</option>
                <option value="question">Pregunta</option>
                <option value="issue">Reporte de problema</option>
                <option value="other">Otro</option>
              </select>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-600 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Publicar
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Feedback List */}
        <div className="space-y-6">
          {feedbacks.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="text-blue-400" size={40} />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Axcanah tlahtolli (Aún no hay mensajes)</h3>
              <p className="text-gray-500">Sé el primero en compartir tus ideas con la comunidad.</p>
            </div>
          ) : (
            feedbacks.map((fb) => (
              <div key={fb.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                <div className="p-4 sm:p-6">
                  {/* Feedback Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 flex items-center justify-center text-white font-bold">
                        {fb.profiles?.full_name?.[0] || (user && user.id === fb.user_id && (user.full_name?.[0] || user.username?.[0])) || 'U'}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-800 truncate">
                          {fb.profiles?.full_name || (user && user.id === fb.user_id && (user.full_name || user.username)) || 'Usuario'}
                        </h3>
                        <span className="text-xs text-gray-400">
                          {formatSafeDate(fb.created_at)}
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 mt-1">{fb.title}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleLike(fb.id)}
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          fb.feedback_likes?.some(l => l.user_id === user?.id) 
                            ? 'bg-blue-100 text-blue-600' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <ThumbsUp size={16} className="mt-0.5" />
                        <span>{fb.feedback_likes?.length || 0}</span>
                      </button>
                    </div>
                  </div>

                  {/* Feedback Content */}
                  <div className="mb-4 pl-0 sm:pl-14">
                    {editingId === fb.id ? (
                      <div className="space-y-2">
                        <textarea
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-gray-800"
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={3}
                        />
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={() => handleEditFeedback(fb.id)}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                          >
                            <Check size={16} />
                            Guardar
                          </button>
                          <button
                            onClick={() => { setEditingId(null); setEditContent(''); }}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                          >
                            <X size={16} />
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-700 whitespace-pre-line">{fb.content}</div>
                    )}
                  </div>

                  {/* Feedback Actions */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pl-0 sm:pl-14">
                    <div className="flex flex-wrap gap-4">
                      <button
                        onClick={() => setReplyingTo(replyingTo === fb.id ? null : fb.id)}
                        className="text-sm text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1"
                      >
                        <MessageCircle size={16} />
                        Responder
                      </button>
                      {canEditFeedback(fb) && (
                        <>
                          <button
                            onClick={() => { setEditingId(fb.id); setEditContent(fb.content || ''); }}
                            className="text-sm text-gray-500 hover:text-gray-700 font-medium flex items-center gap-1"
                          >
                            <Edit size={16} />
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteFeedback(fb.id)}
                            className="text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
                          >
                            <Trash2 size={16} />
                            Eliminar
                          </button>
                        </>
                      )}
                    </div>
                    <button
                      onClick={() => toggleFeedbackExpansion(fb.id)}
                      className="text-sm text-gray-500 hover:text-gray-700 font-medium flex items-center gap-1"
                    >
                      <ChevronDown 
                        size={16} 
                        className={`transition-transform ${expandedFeedback === fb.id ? 'rotate-180' : ''}`}
                      />
                      {expandedFeedback === fb.id ? 'Ocultar' : 'Ver'} respuestas
                    </button>
                  </div>

                  {/* Reply Form */}
                  {replyingTo === fb.id && (
                    <div className="mt-4 pl-14">
                      <div className="flex gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-bold text-sm">
                            {user?.full_name?.[0] || 'T'}
                          </div>
                        </div>
                        <div className="flex-1">
                          <textarea
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-gray-800"
                            placeholder="Escribe tu respuesta..."
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            rows={2}
                          />
                          <div className="flex justify-end gap-2 mt-2">
                            <button
                              onClick={() => { setReplyingTo(null); setReplyContent(''); }}
                              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors text-sm"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={() => handleReply(fb.id)}
                              className="px-3 py-1 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors text-sm flex items-center gap-1"
                            >
                              <Send size={14} />
                              Enviar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Replies */}
                  {expandedFeedback === fb.id && fb.feedback_replies && fb.feedback_replies.length > 0 && (
                    <div className="mt-4 pl-14 space-y-4">
                      {fb.feedback_replies.map((reply) => (
                        <div key={reply.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                                reply.is_admin_reply 
                                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500' 
                                  : 'bg-gradient-to-r from-blue-400 to-indigo-400'
                              }`}>
                                {reply.profiles?.full_name?.[0] || 'A'}
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-gray-800">
                                  {reply.profiles?.full_name || (reply.is_admin_reply ? 'Equipo Nawatlajtol' : 'Usuario')}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {formatSafeDate(reply.created_at)}
                                </span>
                                {reply.is_admin_reply && (
                                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                                    Oficial
                                  </span>
                                )}
                              </div>
                              {editingId === reply.id ? (
                                <div className="space-y-2">
                                  <textarea
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-gray-800 text-sm"
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    rows={2}
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleEditReply(reply.id)}
                                      className="px-3 py-1 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors text-sm"
                                    >
                                      Guardar
                                    </button>
                                    <button
                                      onClick={() => { setEditingId(null); setEditContent(''); }}
                                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors text-sm"
                                    >
                                      Cancelar
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-gray-700 text-sm whitespace-pre-line">{reply.content}</div>
                              )}
                            </div>
                            {canEditReply(reply) && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => { setEditingId(reply.id); setEditContent(reply.content); }}
                                  className="text-gray-400 hover:text-blue-500"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteReply(reply.id)}
                                  className="text-gray-400 hover:text-red-500"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}