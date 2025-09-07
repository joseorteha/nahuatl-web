// lib/contactService.ts
import { supabase } from './supabaseClient';

export interface ContactMessage {
  nombre: string;
  email: string;
  telefono?: string;
  asunto: string;
  mensaje: string;
  tipo_contacto: 'email' | 'chat' | 'general';
}

export interface JoinRequest {
  nombre: string;
  email: string;
  telefono?: string;
  tipo_union: 'registro' | 'contribuir' | 'comunidad' | 'voluntario' | 'maestro' | 'traductor';
  nivel_experiencia: 'principiante' | 'intermedio' | 'avanzado' | 'nativo';
  motivacion?: string;
  habilidades?: string;
  disponibilidad?: string;
}

// Función para enviar mensaje de contacto
export async function submitContactMessage(data: ContactMessage) {
  try {
    // Validar datos
    if (!data.nombre || !data.email || !data.asunto || !data.mensaje) {
      throw new Error('Todos los campos obligatorios deben ser completados');
    }

    // Obtener metadatos del navegador
    const agenteUsuario = typeof window !== 'undefined' ? window.navigator.userAgent : '';
    const urlReferencia = typeof window !== 'undefined' ? window.document.referrer : '';

    const { data: result, error } = await supabase
      .from('mensajes_contacto')
      .insert([{
        nombre: data.nombre.trim(),
        email: data.email.trim().toLowerCase(),
        telefono: data.telefono?.trim() || null,
        asunto: data.asunto.trim(),
        mensaje: data.mensaje.trim(),
        tipo_contacto: data.tipo_contacto,
        agente_usuario: agenteUsuario,
        url_referencia: urlReferencia || null,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error al enviar mensaje de contacto:', error);
      
      // Manejo específico de errores RLS y permisos
      if (error.code === '42501') {
        throw new Error('Error de permisos en la base de datos. Por favor, contacta al administrador.');
      } else if (error.code === '42P01') {
        throw new Error('Las tablas de la base de datos no están configuradas. Por favor, contacta al administrador.');
      } else if (error.message?.includes('JWT')) {
        throw new Error('Error de autenticación. Por favor, recarga la página e intenta de nuevo.');
      }
      
      throw new Error('Error al enviar el mensaje. Por favor, intenta de nuevo.');
    }

    // Si es tipo 'chat', podrías enviar una notificación inmediata
    if (data.tipo_contacto === 'chat') {
      await notificarAdminNuevoChat(result);
    }

    return result;
  } catch (error) {
    console.error('Error en submitContactMessage:', error);
    throw error;
  }
}

// Función para enviar solicitud de unirse
export async function submitJoinRequest(data: JoinRequest) {
  try {
    // Validar datos
    if (!data.nombre || !data.email || !data.tipo_union) {
      throw new Error('Todos los campos obligatorios deben ser completados');
    }

    // Obtener metadatos del navegador
    const agenteUsuario = typeof window !== 'undefined' ? window.navigator.userAgent : '';
    const urlReferencia = typeof window !== 'undefined' ? window.document.referrer : '';

    const { data: result, error } = await supabase
      .from('solicitudes_union')
      .insert([{
        nombre: data.nombre.trim(),
        email: data.email.trim().toLowerCase(),
        telefono: data.telefono?.trim() || null,
        tipo_union: data.tipo_union,
        nivel_experiencia: data.nivel_experiencia,
        motivacion: data.motivacion?.trim() || null,
        habilidades: data.habilidades?.trim() || null,
        disponibilidad: data.disponibilidad?.trim() || null,
        agente_usuario: agenteUsuario,
        url_referencia: urlReferencia || null,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error al enviar solicitud de unirse:', error);
      
      // Manejo específico de errores RLS y permisos
      if (error.code === '42501') {
        throw new Error('Error de permisos en la base de datos. Por favor, contacta al administrador.');
      } else if (error.code === '42P01') {
        throw new Error('Las tablas de la base de datos no están configuradas. Por favor, contacta al administrador.');
      } else if (error.message?.includes('JWT')) {
        throw new Error('Error de autenticación. Por favor, recarga la página e intenta de nuevo.');
      }
      
      throw new Error('Error al enviar la solicitud. Por favor, intenta de nuevo.');
    }

    // Enviar email de bienvenida según el tipo
    await enviarEmailBienvenida(result);

    return result;
  } catch (error) {
    console.error('Error en submitJoinRequest:', error);
    throw error;
  }
}

// Función para obtener mensajes de contacto no leídos (para admins)
export async function obtenerMensajesNoLeidos() {
  try {
    const { data, error } = await supabase
      .from('mensajes_contacto')
      .select('*')
      .eq('estado', 'pendiente')
      .order('fecha_creacion', { ascending: false });

    if (error) {
      console.error('Error al obtener mensajes no leídos:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error en obtenerMensajesNoLeidos:', error);
    throw error;
  }
}

// Función para obtener solicitudes de unirse pendientes (para admins)
export async function obtenerSolicitudesPendientes() {
  try {
    const { data, error } = await supabase
      .from('solicitudes_union')
      .select('*')
      .eq('estado', 'pendiente')
      .order('fecha_creacion', { ascending: false });

    if (error) {
      console.error('Error al obtener solicitudes pendientes:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error en obtenerSolicitudesPendientes:', error);
    throw error;
  }
}

// Función para marcar mensaje como leído
export async function marcarContactoComoLeido(mensajeId: string) {
  try {
    const { error } = await supabase
      .from('mensajes_contacto')
      .update({ 
        estado: 'leido', 
        fecha_leido: new Date().toISOString(),
        fecha_actualizacion: new Date().toISOString()
      })
      .eq('id', mensajeId);

    if (error) {
      console.error('Error al marcar mensaje como leído:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error en marcarContactoComoLeido:', error);
    throw error;
  }
}

// Interfaces para tipificar las respuestas de la base de datos
interface MensajeContactoDB {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
  asunto: string;
  mensaje: string;
  tipo_contacto: string;
  estado: string;
  fecha_creacion: string;
}

interface SolicitudUnionDB {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
  tipo_union: string;
  nivel_experiencia: string;
  motivacion?: string;
  habilidades?: string;
  disponibilidad?: string;
  estado: string;
  fecha_creacion: string;
}

// Función auxiliar para notificar admin de nuevo chat
async function notificarAdminNuevoChat(mensaje: MensajeContactoDB) {
  // Aquí puedes implementar notificación por email, webhook, etc.
  console.log('Nuevo mensaje de chat recibido:', mensaje);
  
  // Ejemplo: enviar webhook a Discord/Slack
  // await fetch('TU_WEBHOOK_URL', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     text: `Nuevo mensaje de chat de ${mensaje.nombre} (${mensaje.email}): ${mensaje.asunto}`
  //   })
  // });
}

// Función auxiliar para enviar email de bienvenida
async function enviarEmailBienvenida(solicitud: SolicitudUnionDB) {
  // Aquí puedes implementar envío de email de bienvenida
  console.log('Enviando email de bienvenida:', solicitud);
  
  // Mensajes de bienvenida por tipo de unión
  const obtenerMensajeBienvenida = (tipoUnion: string): string => {
    const mensajes: Record<string, string> = {
      registro: '¡Bienvenido a Nawatlajtol! Te contactaremos pronto para completar tu registro.',
      contribuir: '¡Gracias por querer contribuir! Revisaremos tu solicitud y te contactaremos.',
      comunidad: '¡Bienvenido a nuestra comunidad! Te enviaremos información sobre eventos y actividades.',
      voluntario: '¡Gracias por querer ser voluntario! Te contactaremos con información sobre oportunidades.',
      maestro: '¡Excelente! Revisaremos tu perfil y te contactaremos sobre oportunidades de enseñanza.',
      traductor: '¡Gracias por tu interés en traducir! Te enviaremos información sobre proyectos activos.'
    };
    
    return mensajes[tipoUnion] || '¡Gracias por unirte a Nawatlajtol! Te contactaremos pronto.';
  };

  const mensaje = obtenerMensajeBienvenida(solicitud.tipo_union);
  console.log('Mensaje de bienvenida:', mensaje);

  // Aquí implementarías el envío real del email
  // Por ejemplo, usando Resend, SendGrid, etc.
}

// Función para validar email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Función para validar teléfono (opcional)
export function isValidPhone(phone: string): boolean {
  if (!phone || phone.trim() === '') return true; // Opcional
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/; // Formato internacional básico
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}
