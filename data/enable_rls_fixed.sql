-- ================================
-- HABILITAR RLS SIN CONFLICTOS - CORREGIDO
-- ================================
-- Script corregido basado en el esquema real de la base de datos

-- Habilitar RLS en las 22 tablas sin políticas existentes
ALTER TABLE public.feedback_compartidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_guardados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historial_puntos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logros_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensajes_contacto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.palabras_guardadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ranking_social ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recompensas_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.respuestas_contacto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retroalimentacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retroalimentacion_hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retroalimentacion_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retroalimentacion_respuestas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seguimientos_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitudes_union ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.temas_conversacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.temas_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.temas_shares ENABLE ROW LEVEL SECURITY;

-- ================================
-- SOLO HABILITAR RLS EN PERFILES
-- ================================
-- La tabla perfiles ya tiene políticas, solo habilitamos RLS
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;

-- ================================
-- POLÍTICAS CORREGIDAS SEGÚN ESQUEMA REAL
-- ================================

-- 👥 SEGUIMIENTOS: Lectura pública, gestión propia
CREATE POLICY "seguimientos_select_public" ON public.seguimientos_usuarios
    FOR SELECT USING (true);

CREATE POLICY "seguimientos_insert_own" ON public.seguimientos_usuarios
    FOR INSERT WITH CHECK (auth.uid() = seguidor_id);

CREATE POLICY "seguimientos_delete_own" ON public.seguimientos_usuarios
    FOR DELETE USING (auth.uid() = seguidor_id);

-- 💬 RETROALIMENTACIÓN: Lectura pública, creación autenticada, edición propia
CREATE POLICY "retroalimentacion_select_public" ON public.retroalimentacion
    FOR SELECT USING (true);

CREATE POLICY "retroalimentacion_insert_auth" ON public.retroalimentacion
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = usuario_id);

CREATE POLICY "retroalimentacion_update_own" ON public.retroalimentacion
    FOR UPDATE USING (auth.uid() = usuario_id);

CREATE POLICY "retroalimentacion_delete_own" ON public.retroalimentacion
    FOR DELETE USING (auth.uid() = usuario_id);

-- ❤️ LIKES: Lectura pública, gestión propia
CREATE POLICY "retroalimentacion_likes_select_public" ON public.retroalimentacion_likes
    FOR SELECT USING (true);

CREATE POLICY "retroalimentacion_likes_insert_own" ON public.retroalimentacion_likes
    FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "retroalimentacion_likes_delete_own" ON public.retroalimentacion_likes
    FOR DELETE USING (auth.uid() = usuario_id);

-- 💬 RESPUESTAS: Lectura pública, creación autenticada, edición propia
CREATE POLICY "retroalimentacion_respuestas_select_public" ON public.retroalimentacion_respuestas
    FOR SELECT USING (true);

CREATE POLICY "retroalimentacion_respuestas_insert_auth" ON public.retroalimentacion_respuestas
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = usuario_id);

CREATE POLICY "retroalimentacion_respuestas_update_own" ON public.retroalimentacion_respuestas
    FOR UPDATE USING (auth.uid() = usuario_id);

-- 🔖 PALABRAS GUARDADAS: Solo el usuario propietario
CREATE POLICY "palabras_guardadas_select_own" ON public.palabras_guardadas
    FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "palabras_guardadas_insert_own" ON public.palabras_guardadas
    FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "palabras_guardadas_delete_own" ON public.palabras_guardadas
    FOR DELETE USING (auth.uid() = usuario_id);

-- 🔔 NOTIFICACIONES: Solo el destinatario
CREATE POLICY "notificaciones_select_own" ON public.notificaciones
    FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "notificaciones_update_own" ON public.notificaciones
    FOR UPDATE USING (auth.uid() = usuario_id);

-- 🏆 RECOMPENSAS: Solo el usuario propietario
CREATE POLICY "recompensas_usuario_select_own" ON public.recompensas_usuario
    FOR SELECT USING (auth.uid() = usuario_id);

-- 📈 HISTORIAL PUNTOS: Solo el usuario propietario
CREATE POLICY "historial_puntos_select_own" ON public.historial_puntos
    FOR SELECT USING (auth.uid() = usuario_id);

-- 🏅 LOGROS: Lectura pública
CREATE POLICY "logros_select_public" ON public.logros
    FOR SELECT USING (true);

-- 🏅 LOGROS USUARIO: Solo el usuario propietario
CREATE POLICY "logros_usuario_select_own" ON public.logros_usuario
    FOR SELECT USING (auth.uid() = usuario_id);

-- 💬 TEMAS CONVERSACIÓN: Lectura pública, creación autenticada
CREATE POLICY "temas_conversacion_select_public" ON public.temas_conversacion
    FOR SELECT USING (true);

CREATE POLICY "temas_conversacion_insert_auth" ON public.temas_conversacion
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = creador_id);

CREATE POLICY "temas_conversacion_update_own" ON public.temas_conversacion
    FOR UPDATE USING (auth.uid() = creador_id);

-- ❤️ TEMAS LIKES: Lectura pública, gestión propia
CREATE POLICY "temas_likes_select_public" ON public.temas_likes
    FOR SELECT USING (true);

CREATE POLICY "temas_likes_insert_own" ON public.temas_likes
    FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "temas_likes_delete_own" ON public.temas_likes
    FOR DELETE USING (auth.uid() = usuario_id);

-- 📤 TEMAS SHARES: Lectura pública, gestión propia
CREATE POLICY "temas_shares_select_public" ON public.temas_shares
    FOR SELECT USING (true);

CREATE POLICY "temas_shares_insert_own" ON public.temas_shares
    FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- 🏷️ HASHTAGS: Lectura pública, creación autenticada
CREATE POLICY "hashtags_select_public" ON public.hashtags
    FOR SELECT USING (true);

CREATE POLICY "hashtags_insert_auth" ON public.hashtags
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 🏷️ RETROALIMENTACIÓN HASHTAGS: Lectura pública
CREATE POLICY "retroalimentacion_hashtags_select_public" ON public.retroalimentacion_hashtags
    FOR SELECT USING (true);

CREATE POLICY "retroalimentacion_hashtags_insert_auth" ON public.retroalimentacion_hashtags
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 📤 FEEDBACK COMPARTIDOS: Lectura pública, gestión propia
CREATE POLICY "feedback_compartidos_select_public" ON public.feedback_compartidos
    FOR SELECT USING (true);

CREATE POLICY "feedback_compartidos_insert_own" ON public.feedback_compartidos
    FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- 🔖 FEEDBACK GUARDADOS: Solo el usuario propietario
CREATE POLICY "feedback_guardados_select_own" ON public.feedback_guardados
    FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "feedback_guardados_insert_own" ON public.feedback_guardados
    FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "feedback_guardados_delete_own" ON public.feedback_guardados
    FOR DELETE USING (auth.uid() = usuario_id);

-- 🏆 RANKING SOCIAL: Lectura pública
CREATE POLICY "ranking_social_select_public" ON public.ranking_social
    FOR SELECT USING (true);

-- 📧 MENCIONES: Solo usuarios involucrados (CORREGIDO)
CREATE POLICY "menciones_select_involved" ON public.menciones
    FOR SELECT USING (
        auth.uid() = mencionado_id OR 
        auth.uid() = mencionador_id
    );

CREATE POLICY "menciones_insert_auth" ON public.menciones
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = mencionador_id);

-- 📨 MENSAJES CONTACTO: Lectura pública para consultas (sin usuario_id en esquema)
CREATE POLICY "mensajes_contacto_select_public" ON public.mensajes_contacto
    FOR SELECT USING (true);

CREATE POLICY "mensajes_contacto_insert_public" ON public.mensajes_contacto
    FOR INSERT WITH CHECK (true);

-- 📧 RESPUESTAS CONTACTO: Solo admins
CREATE POLICY "respuestas_contacto_admin_only" ON public.respuestas_contacto
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- 🤝 SOLICITUDES UNIÓN: Lectura limitada, creación pública
CREATE POLICY "solicitudes_union_select_public" ON public.solicitudes_union
    FOR SELECT USING (true);

CREATE POLICY "solicitudes_union_insert_public" ON public.solicitudes_union
    FOR INSERT WITH CHECK (true);

-- ================================
-- VERIFICACIÓN FINAL
-- ================================

-- Este query te mostrará el estado actualizado
SELECT 
    tablename,
    CASE 
        WHEN rowsecurity THEN '✅ RLS HABILITADO'
        ELSE '❌ RLS DESHABILITADO'
    END as estado_rls
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Contar políticas por tabla después de la aplicación
SELECT 
    tablename,
    COUNT(*) as total_politicas
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;