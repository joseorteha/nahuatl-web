import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  email: string;
  nombre_completo: string | null;
  url_avatar: string | null;
  bio: string | null;
  rol: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Rastrear usuarios procesados para evitar duplicación entre renderizados
  const processedUsers = useRef(new Set<string>());
  const processingUsers = useRef(new Set<string>()); // Para evitar procesamiento concurrente

  // Función para obtener el perfil del usuario
  const fetchUserProfile = async (userId: string, userEmail?: string) => {
    try {
      // Si tenemos email, buscar por email primero (más confiable)
      if (userEmail) {
        const { data: dataByEmail, error: errorByEmail } = await supabase
          .from('perfiles')
          .select('*')
          .eq('email', userEmail)
          .single();

        if (!errorByEmail && dataByEmail) {
          // Si encontramos por email pero el ID es diferente, NO actualizar el ID
          // porque puede tener referencias de foreign key. En su lugar, usar el perfil existente.
          if (dataByEmail.id !== userId) {
            // Perfil encontrado con ID diferente - usar el existente para evitar conflictos de FK
          }

          return dataByEmail;
        }
      }

      // Si no encontramos por email o no tenemos email, intentar por ID
      if (userId) {
        const { data: dataById, error: errorById } = await supabase
          .from('perfiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (!errorById && dataById) {
          return dataById;
        }
      }

      return null;
    } catch (error) {
      console.error('Error en fetchUserProfile:', error);
      return null;
    }
  };

  // Función para crear perfil si no existe
  const createProfileIfNeeded = useCallback(async (authUser: User) => {
    const userKey = authUser.email || authUser.id;
    
    // Evitar procesamiento concurrente del mismo usuario
    if (processingUsers.current.has(userKey)) {
      return;
    }
    
    try {
      processingUsers.current.add(userKey);
      
      // Si ya tenemos un perfil cargado para este usuario, no hacer nada
      if (profile && profile.email === authUser.email) {
        return;
      }
      
      // Verificar si el usuario ya existe en la tabla perfiles
      const existingProfile = await fetchUserProfile(authUser.id, authUser.email);

      // Si ya existe el perfil, actualizar información si es necesario
      if (existingProfile) {
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
          // Usar el ID del perfil existente en lugar del ID de Supabase Auth
          const { data: updateResult, error: updateError } = await supabase
            .from('perfiles')
            .update(updateData)
            .eq('id', existingProfile.id) // Usar el ID del perfil existente
            .select()
            .single();
            
          if (!updateError && updateResult) {
            setProfile(updateResult);
          }
        }
        return;
      }

      // Si no existe el perfil, crearlo
      const isOAuth = authUser.app_metadata?.provider === 'google' || authUser.app_metadata?.provider === 'facebook';
      
      // Para usuarios nuevos, intentar usar el ID de Supabase Auth
      // Pero si hay conflictos, dejar que la base de datos genere el ID automáticamente
      const profileData = {
        email: authUser.email,
        nombre_completo: isOAuth 
          ? (authUser.user_metadata?.full_name || authUser.user_metadata?.name || 'Usuario OAuth')
          : authUser.email?.split('@')[0] || 'Usuario',
        url_avatar: authUser.user_metadata?.avatar_url || null,
      };

      // Intentar primero con el ID de Supabase Auth
      const profileDataWithAuthId = {
        id: authUser.id,
        ...profileData
      };

      const { data: insertData, error: insertError } = await supabase
        .from('perfiles')
        .insert([profileDataWithAuthId])
        .select();

      if (insertError) {
        // Si es error de duplicado o foreign key, intentar sin ID específico
        if (insertError.code === '23505' || insertError.code === '23503') {
          const { data: retryData, error: retryError } = await supabase
            .from('perfiles')
            .insert([profileData]) // Sin ID, que se genere automáticamente
            .select();
            
          if (retryError) {
            // Último intento: obtener el perfil si ya existe
            const finalProfile = await fetchUserProfile(authUser.id, authUser.email);
            if (finalProfile) {
              setProfile(finalProfile);
            }
          } else if (retryData?.[0]) {
            setProfile(retryData[0]);
          }
        } else {
          // Para otros errores, intentar obtener el perfil existente
          const retryProfile = await fetchUserProfile(authUser.id, authUser.email);
          if (retryProfile) {
            setProfile(retryProfile);
          }
        }
      } else if (insertData?.[0]) {
        setProfile(insertData[0]);
      }
    } catch (error) {
      console.error('Error en createProfileIfNeeded:', error);
    } finally {
      processingUsers.current.delete(userKey);
    }
  }, [profile]);

  useEffect(() => {
    // Obtener sesión inicial
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const sessionUser = session?.user ?? null;
        setUser(sessionUser);
        
        // Si hay usuario, verificar/crear perfil SOLO si no se ha procesado
        if (sessionUser && !processedUsers.current.has(sessionUser.email || sessionUser.id)) {
          processedUsers.current.add(sessionUser.email || sessionUser.id);
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
        const authUser = session?.user ?? null;
        setUser(authUser);
        
        if (!authUser) {
          setProfile(null);
          processedUsers.current.clear(); // Limpiar cache cuando no hay usuario
          processingUsers.current.clear(); // Limpiar procesamientos en curso
        } else if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && 
                   !processedUsers.current.has(authUser.email || authUser.id)) {
          processedUsers.current.add(authUser.email || authUser.id);
          await createProfileIfNeeded(authUser);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [createProfileIfNeeded]);

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