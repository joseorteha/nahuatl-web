-- =====================================================
-- SCRIPT: Obtener ID de Profesor
-- Descripción: Encuentra tu ID de usuario profesor
-- =====================================================

-- Ver todos los profesores
SELECT 
  id,
  email,
  nombre_completo,
  rol,
  fecha_creacion
FROM perfiles
WHERE rol = 'profesor'
ORDER BY fecha_creacion DESC;

-- Si no tienes un profesor, este script te ayuda a crear uno o actualizar tu rol
-- Descomenta y ejecuta si necesitas:

/*
-- Opción 1: Actualizar tu usuario existente a profesor
UPDATE perfiles
SET rol = 'profesor'
WHERE email = 'TU_EMAIL@ejemplo.com';

-- Opción 2: Ver tu usuario actual
SELECT id, email, nombre_completo, rol
FROM perfiles
WHERE email = 'TU_EMAIL@ejemplo.com';
*/
