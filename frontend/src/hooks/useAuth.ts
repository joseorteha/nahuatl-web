import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  email: string;
  nombre_completo: string | null;
  url_avatar: string | null;
  bio: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Función para obtener el perfil del usuario
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error obteniendo perfil:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error en fetchUserProfile:', error);
      return null;
    }
  };

  // Función para crear perfil si no existe
  const createProfileIfNeeded = async (authUser: User) => {
    try {
      console.log('🔍 Verificando si existe perfil para usuario:', authUser.email);
      
      // Verificar si el usuario ya existe en la tabla perfiles
      const existingProfile = await fetchUserProfile(authUser.id);

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
          if (insertData?.[0]) {
            setProfile(insertData[0]);
          }
        }
      } else {
        console.log('✅ Perfil ya existe para usuario:', authUser.email);
        setProfile(existingProfile);
        
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
          const { data: updateResult, error: updateError } = await supabase
            .from('perfiles')
            .update(updateData)
            .eq('id', authUser.id)
            .select()
            .single();
            
          if (updateError) {
            console.error('❌ Error al actualizar perfil:', updateError);
          } else {
            console.log('✅ Perfil actualizado exitosamente');
            if (updateResult) {
              setProfile(updateResult);
            }
          }
        }
      }
    } catch (error) {
      console.error('💥 Error en createProfileIfNeeded:', error);
    }
  };

  useEffect(() => {
    // Rastrear usuarios procesados para evitar duplicación
    const processedUsers = new Set<string>();

    // Obtener sesión inicial
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const sessionUser = session?.user ?? null;
        setUser(sessionUser);
        
        // Si hay usuario, verificar/crear perfil SOLO si no se ha procesado
        if (sessionUser && !processedUsers.has(sessionUser.id)) {
          processedUsers.add(sessionUser.id);
          await createProfileIfNeeded(sessionUser);
        }
      } catch (error) {
        console.error('Error obteniendo sesión:', error);
        setUser(null);
        setProfile(null);
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
        
        if (!authUser) {
          setProfile(null);
        } else if (event === 'SIGNED_IN' && !processedUsers.has(authUser.id)) {
          processedUsers.add(authUser.id);
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
      setProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return {
    user,
    profile,
    loading,
    signOut,
    isAuthenticated: !!user
  };
}