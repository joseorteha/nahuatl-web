-- =====================================================
-- SCRIPT: Crear Curso de Ejemplo con Módulos y Lecciones
-- Descripción: Crea un curso completo de Náhuatl Básico
--              con módulos y lecciones para probar el sistema
-- =====================================================

-- NOTA: Reemplaza 'TU_PROFESOR_ID' con el ID real de tu usuario profesor
-- Puedes obtenerlo con: SELECT id, email FROM perfiles WHERE rol = 'profesor';

-- Variables (reemplazar con valores reales)
-- TU_PROFESOR_ID: El UUID de tu usuario profesor

DO $$
DECLARE
  v_profesor_id uuid := 'cfbf1b21-de0c-414f-9a47-f3893da09225'; -- ⚠️ REEMPLAZAR CON TU ID
  v_curso_id uuid;
  v_modulo1_id uuid;
  v_modulo2_id uuid;
  v_modulo3_id uuid;
  v_leccion1_id uuid;
  v_leccion2_id uuid;
  v_leccion3_id uuid;
  v_leccion4_id uuid;
  v_leccion5_id uuid;
  v_leccion6_id uuid;
BEGIN
  
  -- =====================================================
  -- 1. CREAR CURSO
  -- =====================================================
  
  INSERT INTO cursos (
    titulo,
    descripcion,
    categoria,
    nivel,
    duracion_total_minutos,
    imagen_portada,
    profesor_id,
    estado,
    es_destacado,
    es_gratuito,
    requisitos_previos,
    objetivos_curso,
    palabras_clave,
    fecha_publicacion
  ) VALUES (
    'Náhuatl Básico - Primeros Pasos',
    'Aprende los fundamentos del náhuatl clásico. Este curso te introducirá a los saludos, números, colores y vocabulario básico de esta hermosa lengua indígena.',
    'lengua',
    'principiante',
    720, -- 12 horas = 720 minutos
    'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800',
    v_profesor_id,
    'publicado',
    true,
    true,
    ARRAY['Ninguno', 'Ganas de aprender', 'Dedicación de 30 minutos diarios'],
    ARRAY[
      'Comprender los fundamentos de la lengua náhuatl',
      'Saludar y presentarse en náhuatl',
      'Contar del 1 al 20',
      'Identificar colores básicos',
      'Construir frases simples'
    ],
    ARRAY['náhuatl', 'lengua indígena', 'cultura mexicana', 'principiante'],
    now()
  ) RETURNING id INTO v_curso_id;

  RAISE NOTICE '✅ Curso creado con ID: %', v_curso_id;

  -- =====================================================
  -- 2. CREAR MÓDULOS
  -- =====================================================

  -- Módulo 1: Saludos y Presentaciones
  INSERT INTO modulos (
    curso_id,
    titulo,
    descripcion,
    orden_modulo,
    duracion_total_minutos,
    objetivos_modulo
  ) VALUES (
    v_curso_id,
    'Saludos y Presentaciones',
    'Aprende a saludar y presentarte en náhuatl. Conoce las expresiones más comunes para iniciar una conversación.',
    1,
    240, -- 4 horas = 240 minutos
    ARRAY[
      'Saludar en diferentes contextos',
      'Presentarse correctamente',
      'Despedirse de manera apropiada',
      'Usar expresiones de cortesía'
    ]
  ) RETURNING id INTO v_modulo1_id;

  RAISE NOTICE '✅ Módulo 1 creado con ID: %', v_modulo1_id;

  -- Módulo 2: Números y Conteo
  INSERT INTO modulos (
    curso_id,
    titulo,
    descripcion,
    orden_modulo,
    duracion_total_minutos,
    objetivos_modulo
  ) VALUES (
    v_curso_id,
    'Números y Conteo',
    'Domina el sistema numérico náhuatl. Aprende a contar y usar números en contextos cotidianos.',
    2,
    240, -- 4 horas = 240 minutos
    ARRAY[
      'Contar del 1 al 20',
      'Usar números en contextos prácticos',
      'Comprender el sistema vigesimal',
      'Realizar operaciones básicas'
    ]
  ) RETURNING id INTO v_modulo2_id;

  RAISE NOTICE '✅ Módulo 2 creado con ID: %', v_modulo2_id;

  -- Módulo 3: Colores y Naturaleza
  INSERT INTO modulos (
    curso_id,
    titulo,
    descripcion,
    orden_modulo,
    duracion_total_minutos,
    objetivos_modulo
  ) VALUES (
    v_curso_id,
    'Colores y Naturaleza',
    'Descubre los colores en náhuatl y su relación con la naturaleza. Vocabulario esencial para describir el mundo.',
    3,
    240, -- 4 horas = 240 minutos
    ARRAY[
      'Identificar colores básicos',
      'Describir objetos usando colores',
      'Vocabulario de naturaleza',
      'Crear frases descriptivas'
    ]
  ) RETURNING id INTO v_modulo3_id;

  RAISE NOTICE '✅ Módulo 3 creado con ID: %', v_modulo3_id;

  -- =====================================================
  -- 3. CREAR LECCIONES PÚBLICAS
  -- =====================================================

  -- Lección 1: Saludos Formales (Pública)
  INSERT INTO lecciones (
    titulo,
    descripcion,
    categoria,
    nivel,
    contenido_texto,
    contenido_nahuatl,
    objetivos_aprendizaje,
    palabras_clave,
    duracion_estimada,
    profesor_id,
    estado,
    es_publica,
    es_exclusiva_modulo,
    fecha_publicacion
  ) VALUES (
    'Saludos Formales en Náhuatl',
    'Aprende los saludos formales más importantes en náhuatl clásico.',
    'cultura',
    'principiante',
    E'# Saludos Formales en Náhuatl\n\nEn esta lección aprenderás los saludos formales más importantes.\n\n## Saludos Básicos\n\n**Niltze** - Hola (formal)\n**Paquiliztli** - Felicidad/Alegría (usado como saludo)\n**Cualli tonalli** - Buenos días\n**Cualli teotlac** - Buenas tardes\n**Cualli yohualli** - Buenas noches\n\n## Presentaciones\n\n**Notoca...** - Mi nombre es...\n**Quen timotoca?** - ¿Cómo te llamas?\n**Niquelnamiqui** - Mucho gusto\n\n## Práctica\n\nRepite cada saludo en voz alta y practica con diferentes personas.',
    E'Niltze\nPaquiliztli\nCualli tonalli\nCualli teotlac\nCualli yohualli\nNotoca...\nQuen timotoca?\nNiquelnamiqui',
    ARRAY['Saludar formalmente', 'Presentarse', 'Usar expresiones de cortesía'],
    ARRAY['saludos', 'presentaciones', 'náhuatl básico', 'cortesía'],
    20,
    v_profesor_id,
    'publicada',
    true,
    false,
    now()
  ) RETURNING id INTO v_leccion1_id;

  RAISE NOTICE '✅ Lección 1 (Pública) creada con ID: %', v_leccion1_id;

  -- Lección 2: Saludos Informales (Pública)
  INSERT INTO lecciones (
    titulo,
    descripcion,
    categoria,
    nivel,
    contenido_texto,
    contenido_nahuatl,
    objetivos_aprendizaje,
    palabras_clave,
    duracion_estimada,
    profesor_id,
    estado,
    es_publica,
    es_exclusiva_modulo,
    fecha_publicacion
  ) VALUES (
    'Saludos Informales y Despedidas',
    'Aprende a saludar de manera informal y a despedirte correctamente.',
    'cultura',
    'principiante',
    E'# Saludos Informales y Despedidas\n\n## Saludos Informales\n\n**Niltze** - Hola (también informal)\n**Quen tica?** - ¿Cómo estás?\n**Cualli** - Bien\n**Amo cualli** - No bien/Mal\n\n## Despedidas\n\n**Oc ceppa** - Hasta luego\n**Moztla** - Hasta mañana\n**Cualli ohtli** - Buen camino\n**Xicmocahui** - Cuídate\n\n## Expresiones Comunes\n\n**Tlazohcamati** - Gracias\n**Amo tlen** - De nada\n**Quenin?** - ¿Cómo?\n**Campa?** - ¿Dónde?',
    E'Quen tica?\nCualli\nAmo cualli\nOc ceppa\nMoztla\nCualli ohtli\nXicmocahui\nTlazohcamati\nAmo tlen',
    ARRAY['Saludar informalmente', 'Despedirse', 'Expresar gratitud'],
    ARRAY['saludos', 'despedidas', 'expresiones comunes', 'conversación'],
    15,
    v_profesor_id,
    'publicada',
    true,
    false,
    now()
  ) RETURNING id INTO v_leccion2_id;

  RAISE NOTICE '✅ Lección 2 (Pública) creada con ID: %', v_leccion2_id;

  -- Lección 3: Números 1-10 (Pública)
  INSERT INTO lecciones (
    titulo,
    descripcion,
    categoria,
    nivel,
    contenido_texto,
    contenido_nahuatl,
    objetivos_aprendizaje,
    palabras_clave,
    duracion_estimada,
    profesor_id,
    estado,
    es_publica,
    es_exclusiva_modulo,
    fecha_publicacion
  ) VALUES (
    'Números del 1 al 10',
    'Aprende a contar del 1 al 10 en náhuatl.',
    'numeros',
    'principiante',
    E'# Números del 1 al 10\n\n## Los Números Básicos\n\n1. **Ce** - Uno\n2. **Ome** - Dos\n3. **Yei** - Tres\n4. **Nahui** - Cuatro\n5. **Macuilli** - Cinco\n6. **Chicuace** - Seis\n7. **Chicome** - Siete\n8. **Chicuei** - Ocho\n9. **Chiucnahui** - Nueve\n10. **Mahtlactli** - Diez\n\n## Práctica\n\nCuenta objetos en tu entorno usando estos números.\n\n## Ejemplos\n\n**Ce calli** - Una casa\n**Ome cuahuitl** - Dos árboles\n**Yei xochitl** - Tres flores',
    E'Ce\nOme\nYei\nNahui\nMacuilli\nChicuace\nChicome\nChicuei\nChiucnahui\nMahtlactli',
    ARRAY['Contar del 1 al 10', 'Usar números con sustantivos', 'Practicar pronunciación'],
    ARRAY['números', 'conteo', 'matemáticas básicas', 'vocabulario'],
    25,
    v_profesor_id,
    'publicada',
    true,
    false,
    now()
  ) RETURNING id INTO v_leccion3_id;

  RAISE NOTICE '✅ Lección 3 (Pública) creada con ID: %', v_leccion3_id;

  -- Lección 4: Números 11-20 (Pública)
  INSERT INTO lecciones (
    titulo,
    descripcion,
    categoria,
    nivel,
    contenido_texto,
    contenido_nahuatl,
    objetivos_aprendizaje,
    palabras_clave,
    duracion_estimada,
    profesor_id,
    estado,
    es_publica,
    es_exclusiva_modulo,
    fecha_publicacion
  ) VALUES (
    'Números del 11 al 20',
    'Continúa aprendiendo el sistema numérico náhuatl.',
    'numeros',
    'principiante',
    E'# Números del 11 al 20\n\n## Sistema Vigesimal\n\nEl náhuatl usa un sistema vigesimal (base 20).\n\n11. **Mahtlactli once** - Once\n12. **Mahtlactli omome** - Doce\n13. **Mahtlactli omei** - Trece\n14. **Mahtlactli onnahui** - Catorce\n15. **Caxtolli** - Quince\n16. **Caxtolli once** - Dieciséis\n17. **Caxtolli omome** - Diecisiete\n18. **Caxtolli omei** - Dieciocho\n19. **Caxtolli onnahui** - Diecinueve\n20. **Cempoalli** - Veinte\n\n## Patrón\n\nNota cómo se construyen los números combinando bases.',
    E'Mahtlactli once\nMahtlactli omome\nMahtlactli omei\nCaxtolli\nCaxtolli once\nCempoalli',
    ARRAY['Contar del 11 al 20', 'Comprender el sistema vigesimal', 'Construir números compuestos'],
    ARRAY['números', 'sistema vigesimal', 'matemáticas', 'conteo avanzado'],
    20,
    v_profesor_id,
    'publicada',
    true,
    false,
    now()
  ) RETURNING id INTO v_leccion4_id;

  RAISE NOTICE '✅ Lección 4 (Pública) creada con ID: %', v_leccion4_id;

  -- Lección 5: Colores Básicos (Pública)
  INSERT INTO lecciones (
    titulo,
    descripcion,
    categoria,
    nivel,
    contenido_texto,
    contenido_nahuatl,
    objetivos_aprendizaje,
    palabras_clave,
    duracion_estimada,
    profesor_id,
    estado,
    es_publica,
    es_exclusiva_modulo,
    fecha_publicacion
  ) VALUES (
    'Colores Básicos en Náhuatl',
    'Aprende los colores principales y cómo usarlos para describir objetos.',
    'colores',
    'principiante',
    E'# Colores Básicos\n\n## Los Colores Principales\n\n**Iztac** - Blanco\n**Tliltic** - Negro\n**Chichiltic** - Rojo\n**Coztic** - Amarillo\n**Xoxoctic** - Verde/Azul\n**Camohpalli** - Morado\n**Texohtic** - Azul claro\n\n## Uso con Sustantivos\n\n**Iztac xochitl** - Flor blanca\n**Chichiltic cuahuitl** - Árbol rojo\n**Xoxoctic atl** - Agua verde/azul\n\n## Práctica\n\nDescribe objetos de tu entorno usando estos colores.',
    E'Iztac\nTliltic\nChichiltic\nCoztic\nXoxoctic\nCamohpalli\nTexohtic',
    ARRAY['Identificar colores', 'Describir objetos', 'Usar adjetivos de color'],
    ARRAY['colores', 'adjetivos', 'descripción', 'vocabulario visual'],
    18,
    v_profesor_id,
    'publicada',
    true,
    false,
    now()
  ) RETURNING id INTO v_leccion5_id;

  RAISE NOTICE '✅ Lección 5 (Pública) creada con ID: %', v_leccion5_id;

  -- =====================================================
  -- 4. CREAR LECCIONES EXCLUSIVAS
  -- =====================================================

  -- Lección Exclusiva para Módulo 1
  INSERT INTO lecciones (
    titulo,
    descripcion,
    categoria,
    nivel,
    contenido_texto,
    contenido_nahuatl,
    objetivos_aprendizaje,
    palabras_clave,
    duracion_estimada,
    profesor_id,
    estado,
    es_publica,
    es_exclusiva_modulo,
    modulo_exclusivo_id,
    fecha_publicacion
  ) VALUES (
    'Introducción al Módulo de Saludos',
    'Bienvenida y contexto cultural de los saludos en náhuatl.',
    'cultura',
    'principiante',
    E'# Bienvenido al Módulo de Saludos\n\n## Importancia Cultural\n\nLos saludos en náhuatl no son solo palabras, son expresiones de respeto y conexión con la comunidad.\n\n## Lo que Aprenderás\n\nEn este módulo dominarás:\n- Saludos formales e informales\n- Presentaciones personales\n- Despedidas apropiadas\n- Expresiones de cortesía\n\n## Contexto Histórico\n\nLos saludos náhuatl reflejan la cosmovisión mesoamericana de respeto y reciprocidad.\n\n## Preparación\n\nTen a mano papel y lápiz para practicar la escritura de las palabras.',
    E'Niltze - Saludo de respeto\nPaquiliztli - Felicidad compartida',
    ARRAY['Comprender el contexto cultural', 'Prepararse para el aprendizaje'],
    ARRAY['introducción', 'cultura', 'contexto', 'preparación'],
    10,
    v_profesor_id,
    'publicada',
    false,
    true,
    v_modulo1_id,
    now()
  ) RETURNING id INTO v_leccion6_id;

  RAISE NOTICE '✅ Lección 6 (Exclusiva Módulo 1) creada con ID: %', v_leccion6_id;

  -- =====================================================
  -- 5. VINCULAR LECCIONES A MÓDULOS
  -- =====================================================

  -- Módulo 1: Saludos y Presentaciones
  INSERT INTO modulos_lecciones (modulo_id, leccion_id, orden_en_modulo, es_obligatoria) VALUES
    (v_modulo1_id, v_leccion6_id, 1, true),  -- Introducción (exclusiva)
    (v_modulo1_id, v_leccion1_id, 2, true),  -- Saludos formales
    (v_modulo1_id, v_leccion2_id, 3, true);  -- Saludos informales

  RAISE NOTICE '✅ Lecciones vinculadas al Módulo 1';

  -- Módulo 2: Números y Conteo
  INSERT INTO modulos_lecciones (modulo_id, leccion_id, orden_en_modulo, es_obligatoria) VALUES
    (v_modulo2_id, v_leccion3_id, 1, true),  -- Números 1-10
    (v_modulo2_id, v_leccion4_id, 2, true);  -- Números 11-20

  RAISE NOTICE '✅ Lecciones vinculadas al Módulo 2';

  -- Módulo 3: Colores y Naturaleza
  INSERT INTO modulos_lecciones (modulo_id, leccion_id, orden_en_modulo, es_obligatoria) VALUES
    (v_modulo3_id, v_leccion5_id, 1, true);  -- Colores básicos

  RAISE NOTICE '✅ Lecciones vinculadas al Módulo 3';

  -- =====================================================
  -- RESUMEN
  -- =====================================================

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ CURSO CREADO EXITOSAMENTE';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Curso ID: %', v_curso_id;
  RAISE NOTICE 'Módulos creados: 3';
  RAISE NOTICE 'Lecciones públicas: 5';
  RAISE NOTICE 'Lecciones exclusivas: 1';
  RAISE NOTICE 'Total lecciones: 6';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Para ver el curso:';
  RAISE NOTICE 'SELECT * FROM cursos WHERE id = ''%'';', v_curso_id;
  RAISE NOTICE '';
  RAISE NOTICE '📚 Para ver los módulos:';
  RAISE NOTICE 'SELECT * FROM modulos WHERE curso_id = ''%'';', v_curso_id;
  RAISE NOTICE '';
  RAISE NOTICE '📖 Para ver las lecciones:';
  RAISE NOTICE 'SELECT l.*, ml.orden_en_modulo, ml.es_obligatoria';
  RAISE NOTICE 'FROM lecciones l';
  RAISE NOTICE 'JOIN modulos_lecciones ml ON l.id = ml.leccion_id';
  RAISE NOTICE 'WHERE ml.modulo_id IN (SELECT id FROM modulos WHERE curso_id = ''%'');', v_curso_id;

END $$;
