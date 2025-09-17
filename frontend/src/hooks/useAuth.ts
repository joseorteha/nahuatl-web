import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Función para crear perfil si no existe
  const createProfileIfNeeded = async (authUser: User) => {
    try {
      console.log('🔍 Verificando si existe perfil para usuario:', authUser.email);
      
      // Verificar si el usuario ya existe en la tabla perfiles
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileCheckError && profileCheckError.code !== 'PGRST116') {
        console.error('❌ Error al verificar perfil:', profileCheckError);
        return;
      }

      // Si no existe el perfil, crearlo
      if (!existingProfile) {
        console.log('📝 Creando perfil para usuario OAuth:', authUser.email);
        
        const profileData = {
          id: authUser.id, // Usar el ID de Supabase Auth
          email: authUser.email,
          nombre_completo: authUser.user_metadata?.full_name || 
                          authUser.user_metadata?.name || 
                          'Usuario OAuth',
          url_avatar: authUser.user_metadata?.avatar_url || null,
          // NO incluir password para usuarios OAuth
        };

        const { data: insertData, error: insertError } = await supabase
          .from('perfiles')
          .insert([profileData])
          .select();

        if (insertError) {
          console.error('❌ Error al crear perfil:', insertError);
        } else {
          console.log('✅ Perfil creado exitosamente:', insertData);
        }
      } else {
        console.log('✅ Perfil ya existe para usuario:', authUser.email);
        
        // Actualizar información si es necesario (como avatar de Google)
        const updateData: { url_avatar?: string; nombre_completo?: string } = {};
        
        if (authUser.app_metadata?.provider === 'google' && authUser.user_metadata?.avatar_url) {
          updateData.url_avatar = authUser.user_metadata.avatar_url;
        }
        
        if (authUser.user_metadata?.full_name && existingProfile.nombre_completo !== authUser.user_metadata.full_name) {
          updateData.nombre_completo = authUser.user_metadata.full_name;
        }

        if (Object.keys(updateData).length > 0) {
          console.log('🔄 Actualizando perfil con:', updateData);
          const { error: updateError } = await supabase
            .from('perfiles')
            .update(updateData)
            .eq('id', authUser.id);
            
          if (updateError) {
            console.error('❌ Error al actualizar perfil:', updateError);
          } else {
            console.log('✅ Perfil actualizado exitosamente');
          }
        }
      }
    } catch (error) {
      console.error('💥 Error en createProfileIfNeeded:', error);
    }
  };

  useEffect(() => {
    // Obtener sesión inicial
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const sessionUser = session?.user ?? null;
        setUser(sessionUser);
        
        // Si hay usuario, verificar/crear perfil
        if (sessionUser) {
          await createProfileIfNeeded(sessionUser);
        }
      } catch (error) {
        console.error('Error obteniendo sesión:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        const authUser = session?.user ?? null;
        setUser(authUser);
        
        // Si hay usuario nuevo (SIGNED_IN), verificar/crear perfil
        if (authUser && event === 'SIGNED_IN') {
          await createProfileIfNeeded(authUser);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return {
    user,
    loading,
    signOut,
    isAuthenticated: !!user
  };
}