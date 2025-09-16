-- ============================================
-- SISTEMA DE CONTRIBUCIONES AUTOMATIZADO PARA NAHUATL-WEB
-- ============================================

-- 1. Función que transfiere una contribución aprobada al diccionario principal
CREATE OR REPLACE FUNCTION transferir_contribucion_aprobada()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo procesar si el estado cambió a 'aprobada' y es diferente al anterior
  IF NEW.estado = 'aprobada' AND (OLD.estado IS NULL OR OLD.estado != 'aprobada') THEN
    
    -- Insertar la palabra en el diccionario principal
    INSERT INTO public.diccionario (
      word,
      variants,
      info_gramatical,
      definition,
      nombre_cientifico,
      examples,
      synonyms,
      roots,
      ver_tambien,
      ortografias_alternativas,
      notes,
      usuario_id,
      fecha_creacion,
      fecha_actualizacion
    )
    VALUES (
      NEW.word,
      NEW.variants,
      NEW.info_gramatical,
      NEW.definition,
      NEW.nombre_cientifico,
      NEW.examples,
      NEW.synonyms,
      NEW.roots,
      NEW.ver_tambien,
      NEW.ortografias_alternativas,
      NEW.notes,
      NEW.usuario_id,
      NEW.fecha_creacion,
      NOW()
    );
    
    -- Actualizar el estado a 'publicada' para indicar que ya se transfirió
    NEW.estado = 'publicada';
    
    -- Registrar puntos para el usuario
    INSERT INTO public.historial_puntos (
      usuario_id,
      puntos_ganados,
      motivo,
      descripcion
    )
    VALUES (
      NEW.usuario_id,
      50,
      'contribucion_aprobada',
      'Contribución aprobada: ' || NEW.word
    );
    
    -- Actualizar contador de contribuciones aprobadas del usuario
    INSERT INTO public.recompensas_usuario (usuario_id, contribuciones_aprobadas, puntos_totales)
    VALUES (NEW.usuario_id, 1, 50)
    ON CONFLICT (usuario_id) 
    DO UPDATE SET 
      contribuciones_aprobadas = recompensas_usuario.contribuciones_aprobadas + 1,
      puntos_totales = recompensas_usuario.puntos_totales + 50,
      fecha_actualizacion = NOW();
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Crear trigger que ejecuta la función cuando se actualiza una contribución
DROP TRIGGER IF EXISTS trigger_transferir_contribucion ON public.contribuciones_diccionario;

CREATE TRIGGER trigger_transferir_contribucion
  BEFORE UPDATE ON public.contribuciones_diccionario
  FOR EACH ROW
  EXECUTE FUNCTION transferir_contribucion_aprobada();

-- 3. Función para obtener estadísticas del panel de contribuciones
CREATE OR REPLACE FUNCTION obtener_estadisticas_contribuciones()
RETURNS TABLE (
  total_palabras_diccionario BIGINT,
  total_contribuciones BIGINT,
  contribuciones_pendientes BIGINT,
  contribuciones_aprobadas BIGINT,
  contribuciones_publicadas BIGINT,
  contribuciones_rechazadas BIGINT,
  total_contribuidores BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.diccionario) as total_palabras_diccionario,
    (SELECT COUNT(*) FROM public.contribuciones_diccionario) as total_contribuciones,
    (SELECT COUNT(*) FROM public.contribuciones_diccionario WHERE estado = 'pendiente') as contribuciones_pendientes,
    (SELECT COUNT(*) FROM public.contribuciones_diccionario WHERE estado = 'aprobada') as contribuciones_aprobadas,
    (SELECT COUNT(*) FROM public.contribuciones_diccionario WHERE estado = 'publicada') as contribuciones_publicadas,
    (SELECT COUNT(*) FROM public.contribuciones_diccionario WHERE estado = 'rechazada') as contribuciones_rechazadas,
    (SELECT COUNT(DISTINCT usuario_id) FROM public.contribuciones_diccionario) as total_contribuidores;
END;
$$ LANGUAGE plpgsql;
