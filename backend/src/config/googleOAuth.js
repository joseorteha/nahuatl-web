// config/googleOAuth.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { supabase } = require('./database');
const bcrypt = require('bcrypt');

// Configuración de Google OAuth
const googleOAuthConfig = {
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
};

// Validar que las variables de entorno estén configuradas
if (!googleOAuthConfig.clientID || !googleOAuthConfig.clientSecret || !googleOAuthConfig.callbackURL) {
  console.error('❌ ERROR: Variables de entorno de Google OAuth no configuradas');
  console.error('Variables requeridas: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL');
  process.exit(1);
}

// Configurar estrategia de Google
passport.use(new GoogleStrategy(googleOAuthConfig, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('Google OAuth profile:', profile);
    
    const { id, displayName, emails, photos } = profile;
    const email = emails[0].value;
    const avatarUrl = photos[0]?.value;

    // Buscar usuario existente por email
    const { data: existingUser, error: findError } = await supabase
      .from('perfiles')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (findError) {
      console.error('Error buscando usuario:', findError);
      return done(findError, null);
    }

    if (existingUser) {
      // Usuario existe, actualizar datos de Google si es necesario
      const updateData = {};
      
      if (!existingUser.nombre_completo && displayName) {
        updateData.nombre_completo = displayName;
      }
      
      if (!existingUser.url_avatar && avatarUrl) {
        updateData.url_avatar = avatarUrl;
      }

      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from('perfiles')
          .update(updateData)
          .eq('id', existingUser.id);

        if (updateError) {
          console.error('Error actualizando usuario:', updateError);
        }
      }

      return done(null, existingUser);
    } else {
      // Crear nuevo usuario
      const newUser = {
        email: email,
        nombre_completo: displayName || email.split('@')[0],
        username: email.split('@')[0], // Usar email como username por defecto
        url_avatar: avatarUrl || null,
        rol: 'usuario',
        // No establecer contraseña para usuarios OAuth
        password: null
      };

      const { data: createdUser, error: createError } = await supabase
        .from('perfiles')
        .insert([newUser])
        .select('*')
        .single();

      if (createError) {
        console.error('Error creando usuario:', createError);
        return done(createError, null);
      }

      return done(null, createdUser);
    }
  } catch (error) {
    console.error('Error en Google OAuth:', error);
    return done(error, null);
  }
}));

// Serializar usuario para la sesión
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserializar usuario de la sesión
passport.deserializeUser(async (id, done) => {
  try {
    const { data: user, error } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return done(error, null);
    }

    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = {
  passport,
  googleOAuthConfig
};
