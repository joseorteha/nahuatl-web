import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    
    try {
      // Intercambiar el código por la sesión
      const { data: { session }, error: authError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (authError) {
        console.error('Error de autenticación:', authError);
        return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_error`);
      }

      if (session?.user) {
        const user = session.user;
        
        // Verificar si el usuario ya existe en la tabla perfiles
        const { data: existingProfile, error: profileCheckError } = await supabase
          .from('perfiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileCheckError && profileCheckError.code !== 'PGRST116') {
          console.error('Error al verificar perfil:', profileCheckError);
        }

        // Si no existe el perfil, crearlo
        if (!existingProfile) {
          const profileData: {
            id: string;
            email: string | undefined;
            nombre_completo: string;
            rol: string;
            provider: string;
            fecha_registro: string;
            activo: boolean;
            url_avatar?: string;
          } = {
            id: user.id,
            email: user.email,
            nombre_completo: user.user_metadata?.full_name || user.user_metadata?.name || 'Usuario OAuth',
            rol: 'usuario', // rol por defecto
            provider: user.app_metadata?.provider || 'oauth',
            fecha_registro: new Date().toISOString(),
            activo: true
          };

          // Si viene de Google, usar el avatar de Google
          if (user.app_metadata?.provider === 'google' && user.user_metadata?.avatar_url) {
            profileData.url_avatar = user.user_metadata.avatar_url;
          }

          const { error: insertError } = await supabase
            .from('perfiles')
            .insert([profileData]);

          if (insertError) {
            console.error('Error al crear perfil:', insertError);
            // No redirigir con error, el usuario puede usar la app sin perfil completo
          }
        } else {
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
            await supabase
              .from('perfiles')
              .update(updateData)
              .eq('id', user.id);
          }
        }
      }
    } catch (error) {
      console.error('Error en callback OAuth:', error);
      return NextResponse.redirect(`${requestUrl.origin}/login?error=callback_error`);
    }
  }

  // Redirigir al dashboard después de autenticación exitosa
  return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
}
