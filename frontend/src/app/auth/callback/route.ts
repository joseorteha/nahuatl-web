import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('🚀 Iniciando callback OAuth...');
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  console.log('🔑 Código OAuth recibido:', code ? 'SÍ' : 'NO');

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    
    try {
      console.log('🔄 Intercambiando código por sesión...');
      // Intercambiar el código por la sesión
      const { data: { session }, error: authError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (authError) {
        console.error('❌ Error de autenticación:', authError);
        return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_error`);
      }

      console.log('✅ Sesión obtenida exitosamente');

      if (session?.user) {
        const user = session.user;
        console.log('✅ Usuario autenticado exitosamente:', {
          id: user.id,
          email: user.email,
          provider: user.app_metadata?.provider,
          user_metadata: user.user_metadata
        });
        
        // Verificar si el usuario ya existe en la tabla perfiles
        const { data: existingProfile, error: profileCheckError } = await supabase
          .from('perfiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileCheckError && profileCheckError.code !== 'PGRST116') {
          console.error('❌ Error al verificar perfil:', profileCheckError);
        }

        console.log('🔍 Verificación de perfil existente:', {
          existingProfile: existingProfile ? 'SÍ EXISTE' : 'NO EXISTE',
          profileCheckError: profileCheckError?.code
        });

        // Si no existe el perfil, crearlo
        if (!existingProfile) {
          const profileData = {
            id: user.id, // Usar el ID de Supabase Auth directamente
            email: user.email,
            nombre_completo: user.user_metadata?.full_name || user.user_metadata?.name || 'Usuario OAuth',
            url_avatar: null as string | null
          };

          // Si viene de Google, usar el avatar de Google
          if (user.app_metadata?.provider === 'google' && user.user_metadata?.avatar_url) {
            profileData.url_avatar = user.user_metadata.avatar_url;
          }

          console.log('📝 Intentando crear perfil con datos:', profileData);

          const { data: insertData, error: insertError } = await supabase
            .from('perfiles')
            .insert([profileData])
            .select();

          if (insertError) {
            console.error('❌ Error al crear perfil:', insertError);
            console.error('📊 Código de error:', insertError.code);
            console.error('📊 Mensaje completo:', insertError.message);
            console.error('📊 Detalles adicionales:', insertError.details);
            console.error('📊 Datos del perfil que causaron error:', profileData);
            
            // Si el error es porque el usuario ya existe, continuar normalmente
            if (insertError.code === '23505' || insertError.message.includes('duplicate key')) {
              console.log('⚠️ Usuario ya existe en BD, continuando...');
            } else {
              console.error('💥 Error CRÍTICO al crear perfil - Usuario no se creará en BD');
              // No redirigir a error, sino intentar continuar con OAuth exitoso
              console.error('🔄 Continuando con OAuth exitoso a pesar del error de BD...');
            }
          } else {
            console.log('✅ Perfil creado exitosamente en BD:', insertData);
          }
        } else {
          console.log('✅ Usuario ya tiene perfil en BD, actualizando información si es necesario');
          
          // Actualizar información si es necesario (como avatar de Google)
          const updateData: {
            url_avatar?: string;
            nombre_completo?: string;
          } = {};
          
          if (user.app_metadata?.provider === 'google' && user.user_metadata?.avatar_url) {
            updateData.url_avatar = user.user_metadata.avatar_url;
          }
          
          if (user.user_metadata?.full_name && existingProfile.nombre_completo !== user.user_metadata.full_name) {
            updateData.nombre_completo = user.user_metadata.full_name;
          }

          if (Object.keys(updateData).length > 0) {
            console.log('🔄 Actualizando perfil con:', updateData);
            const { error: updateError } = await supabase
              .from('perfiles')
              .update(updateData)
              .eq('id', user.id);
              
            if (updateError) {
              console.error('❌ Error al actualizar perfil:', updateError);
            } else {
              console.log('✅ Perfil actualizado exitosamente');
            }
          } else {
            console.log('ℹ️ No hay datos que actualizar en el perfil');
          }
        }
      }
      console.log('🎯 Proceso de autenticación completado, redirigiendo al dashboard...');
    } catch (error) {
      console.error('💥 Error CRÍTICO en callback OAuth:', error);
      return NextResponse.redirect(`${requestUrl.origin}/login?error=callback_error`);
    }
  } else {
    console.error('❌ No se recibió código OAuth');
  }

  // Redirigir al dashboard después de autenticación exitosa
  console.log('🏠 Redirigiendo al dashboard...');
  return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
}
