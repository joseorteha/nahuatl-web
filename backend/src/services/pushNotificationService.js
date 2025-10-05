// services/pushNotificationService.js
const webpush = require('web-push');
const { supabase } = require('../config/database');
const config = require('../config/environment');

class PushNotificationService {
  constructor() {
    // Configurar VAPID keys
    if (config.VAPID_PUBLIC_KEY && config.VAPID_PRIVATE_KEY) {
      webpush.setVapidDetails(
        'mailto:joseortegahac@gmail.com',
        config.VAPID_PUBLIC_KEY,
        config.VAPID_PRIVATE_KEY
      );
      console.log('✅ VAPID keys configuradas para push notifications');
    } else {
      console.warn('⚠️ VAPID keys no configuradas - push notifications deshabilitadas');
    }
  }

  /**
   * Suscribir usuario a push notifications
   */
  async subscribeToPush(userId, subscription) {
    try {
      console.log('📱 Suscribiendo usuario a push notifications:', userId);

      // Guardar suscripción en la base de datos
      const { data, error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: userId,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
        .select();

      if (error) {
        console.error('❌ Error guardando suscripción:', error);
        throw error;
      }

      console.log('✅ Suscripción guardada exitosamente');
      return { success: true, data };
    } catch (error) {
      console.error('Error en subscribeToPush:', error);
      throw error;
    }
  }

  /**
   * Desuscribir usuario de push notifications
   */
  async unsubscribeFromPush(userId) {
    try {
      console.log('📱 Desuscribiendo usuario de push notifications:', userId);

      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Error eliminando suscripción:', error);
        throw error;
      }

      console.log('✅ Suscripción eliminada exitosamente');
      return { success: true };
    } catch (error) {
      console.error('Error en unsubscribeFromPush:', error);
      throw error;
    }
  }

  /**
   * Enviar push notification a un usuario específico
   */
  async sendToUser(userId, payload) {
    try {
      console.log('📤 Enviando push notification a usuario:', userId);

      // Obtener suscripción del usuario
      const { data: subscription, error } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !subscription) {
        console.log('⚠️ Usuario no tiene suscripción activa:', userId);
        return { success: false, reason: 'No subscription found' };
      }

      // Reconstruir objeto de suscripción
      const pushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth
        }
      };

      // Preparar payload
      const notificationPayload = JSON.stringify({
        title: payload.title || 'Nawatlahtol',
        body: payload.body || 'Nueva actividad en tu cuenta',
        icon: '/logooo.png',
        badge: '/logooo.png',
        data: {
          url: payload.url || '/dashboard',
          ...payload.data
        },
        actions: [
          {
            action: 'open',
            title: 'Ver',
            icon: '/logooo.png'
          },
          {
            action: 'close',
            title: 'Cerrar'
          }
        ]
      });

      // Enviar push notification
      await webpush.sendNotification(pushSubscription, notificationPayload);

      console.log('✅ Push notification enviada exitosamente');
      return { success: true };

    } catch (error) {
      console.error('❌ Error enviando push notification:', error);
      
      // Si la suscripción es inválida, eliminarla
      if (error.statusCode === 410) {
        console.log('🗑️ Eliminando suscripción inválida para usuario:', userId);
        await this.unsubscribeFromPush(userId);
      }

      throw error;
    }
  }

  /**
   * Enviar push notification a múltiples usuarios
   */
  async sendToMultipleUsers(userIds, payload) {
    try {
      console.log('📤 Enviando push notifications a múltiples usuarios:', userIds.length);

      const results = await Promise.allSettled(
        userIds.map(userId => this.sendToUser(userId, payload))
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      console.log(`✅ Push notifications enviadas: ${successful} exitosas, ${failed} fallidas`);

      return {
        success: true,
        stats: { successful, failed, total: userIds.length }
      };

    } catch (error) {
      console.error('Error en sendToMultipleUsers:', error);
      throw error;
    }
  }

  /**
   * Enviar push notification por tipo de notificación
   */
  async sendNotificationByType(userId, type, data) {
    const notificationTypes = {
      'like_recibido': {
        title: '❤️ Nuevo Like',
        body: `¡Alguien le gustó tu ${data.tipo || 'contenido'}!`,
        url: `/feedback/tema/${data.tema_id || ''}`
      },
      'respuesta_recibida': {
        title: '💬 Nueva Respuesta',
        body: `${data.autor || 'Alguien'} respondió a tu tema`,
        url: `/feedback/tema/${data.tema_id || ''}`
      },
      'nuevo_seguidor': {
        title: '👥 Nuevo Seguidor',
        body: `${data.seguidor || 'Alguien'} ahora te sigue`,
        url: `/profile/${data.seguidor_id || ''}`
      },
      'contribucion_aprobada': {
        title: '✅ Contribución Aprobada',
        body: 'Tu contribución ha sido aprobada',
        url: '/contribuir'
      },
      'contribucion_rechazada': {
        title: '❌ Contribución Rechazada',
        body: 'Tu contribución necesita revisión',
        url: '/contribuir'
      },
      'puntos_ganados': {
        title: '🏆 Puntos Ganados',
        body: `¡Ganaste ${data.puntos || 0} puntos!`,
        url: '/profile'
      },
      'logro_obtenido': {
        title: '🎖️ Nuevo Logro',
        body: `¡Desbloqueaste: ${data.logro || 'Nuevo logro'}!`,
        url: '/profile'
      }
    };

    const notification = notificationTypes[type] || {
      title: 'Nawatlahtol',
      body: 'Tienes una nueva notificación',
      url: '/dashboard'
    };

    return await this.sendToUser(userId, notification);
  }

  /**
   * Obtener estadísticas de push notifications
   */
  async getStats() {
    try {
      const { data: stats, error } = await supabase
        .from('push_subscriptions')
        .select('user_id, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return {
        total_subscriptions: stats.length,
        active_users: stats.length,
        recent_subscriptions: stats.filter(s => 
          new Date(s.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length
      };

    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }
}

module.exports = new PushNotificationService();