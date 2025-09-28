const fs = require('fs');

// Función para extraer lecciones del archivo dicc-zon.md
function extractLessons() {
  try {
    const content = fs.readFileSync('dicc-zon.md', 'utf8');
    const lines = content.split('\n');
    
    const lessons = {
      "lecciones": []
    };
    
    let currentLesson = null;
    let lessonId = 1;
    
    // Buscar secciones específicas
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Sección de Adverbios
      if (line.includes('## **LOS** **ADVERBIOS**')) {
        currentLesson = {
          id: `leccion-${lessonId++}`,
          titulo: "Adverbios Básicos",
          descripcion: "Aprende los adverbios más comunes en náhuatl con ejemplos de uso",
          nivel: "principiante",
          duracion: "20 minutos",
          categoria: "gramatica",
          palabras: [],
          ejercicios: []
        };
        continue;
      }
      
      // Sección de Partículas
      if (line.includes('## **LAS** **PARTICULAS**')) {
        if (currentLesson) {
          lessons.lecciones.push(currentLesson);
        }
        currentLesson = {
          id: `leccion-${lessonId++}`,
          titulo: "Partículas y Conectores",
          descripcion: "Aprende las partículas que conectan palabras y frases en náhuatl",
          nivel: "principiante",
          duracion: "25 minutos",
          categoria: "gramatica",
          palabras: [],
          ejercicios: []
        };
        continue;
      }
      
      // Sección de Numerales
      if (line.includes('## **LOS** **NUMERALES**')) {
        if (currentLesson) {
          lessons.lecciones.push(currentLesson);
        }
        currentLesson = {
          id: `leccion-${lessonId++}`,
          titulo: "Sistema Numeral",
          descripcion: "Aprende el sistema de numeración vigesimal del náhuatl",
          nivel: "intermedio",
          duracion: "30 minutos",
          categoria: "numeros",
          palabras: [],
          ejercicios: []
        };
        continue;
      }
      
      // Procesar líneas con ejemplos
      if (currentLesson && line.includes('–') && line.includes('*')) {
        // Extraer palabra náhuatl y traducción
        const match = line.match(/\*([^*]+)\*[^–]*–\s*\*?([^*]+)\*?/);
        if (match) {
          const nahuatl = match[1].trim();
          const espanol = match[2].trim();
          
          // Buscar ejemplo en la siguiente línea
          let ejemplo = '';
          if (i + 1 < lines.length) {
            const nextLine = lines[i + 1].trim();
            if (nextLine.includes('*') && nextLine.includes('–')) {
              const ejemploMatch = nextLine.match(/\*([^*]+)\*[^–]*–\s*\*?([^*]+)\*?/);
              if (ejemploMatch) {
                ejemplo = `${ejemploMatch[1]} – ${ejemploMatch[2]}`;
              }
            }
          }
          
          currentLesson.palabras.push({
            nahuatl: nahuatl,
            espanol: espanol,
            pronunciacion: '', // Se puede agregar después
            ejemplo: ejemplo
          });
        }
      }
      
      // Detectar fin de sección
      if (line.startsWith('## **') && currentLesson && 
          !line.includes('ADVERBIOS') && 
          !line.includes('PARTICULAS') && 
          !line.includes('NUMERALES')) {
        if (currentLesson) {
          lessons.lecciones.push(currentLesson);
          currentLesson = null;
        }
      }
    }
    
    // Agregar la última lección si existe
    if (currentLesson) {
      lessons.lecciones.push(currentLesson);
    }
    
    // Agregar ejercicios a cada lección
    lessons.lecciones.forEach(leccion => {
      leccion.ejercicios = generateExercises(leccion);
    });
    
    return lessons;
    
  } catch (error) {
    console.error('Error al procesar el archivo:', error);
    return null;
  }
}

// Función para generar ejercicios basados en las palabras
function generateExercises(leccion) {
  const ejercicios = [];
  
  // Generar múltiples ejercicios de traducción (3-5 ejercicios)
  const numEjercicios = Math.min(5, Math.max(3, Math.floor(leccion.palabras.length / 3)));
  
  for (let i = 0; i < numEjercicios; i++) {
    const palabra = leccion.palabras[i];
    if (!palabra) break;
    
    // Crear opciones mezclando palabras de la lección
    const opciones = [palabra.nahuatl];
    const otrasPalabras = leccion.palabras.filter((p, index) => index !== i);
    
    // Agregar 2 opciones incorrectas aleatorias
    for (let j = 0; j < 2 && j < otrasPalabras.length; j++) {
      const opcionIncorrecta = otrasPalabras[j].nahuatl;
      if (!opciones.includes(opcionIncorrecta)) {
        opciones.push(opcionIncorrecta);
      }
    }
    
    // Si no hay suficientes opciones, agregar opciones genéricas
    while (opciones.length < 3) {
      const opcionGenerica = `opcion${opciones.length}`;
      if (!opciones.includes(opcionGenerica)) {
        opciones.push(opcionGenerica);
      }
    }
    
    // Mezclar las opciones
    for (let k = opciones.length - 1; k > 0; k--) {
      const j = Math.floor(Math.random() * (k + 1));
      [opciones[k], opciones[j]] = [opciones[j], opciones[k]];
    }
    
    ejercicios.push({
      tipo: "traduccion",
      pregunta: `¿Cómo se dice "${palabra.espanol}" en náhuatl?`,
      opciones: opciones,
      respuesta_correcta: palabra.nahuatl,
      explicacion: `"${palabra.nahuatl}" significa "${palabra.espanol}" en náhuatl.`
    });
  }
  
  // Generar ejercicios de comprensión (2-3 ejercicios)
  const numComprension = Math.min(3, Math.max(2, Math.floor(leccion.palabras.length / 4)));
  
  for (let i = 0; i < numComprension; i++) {
    const palabra = leccion.palabras[i + numEjercicios];
    if (!palabra) break;
    
    // Crear opciones mezclando traducciones de la lección
    const opciones = [palabra.espanol];
    const otrasPalabras = leccion.palabras.filter((p, index) => index !== (i + numEjercicios));
    
    // Agregar 2 opciones incorrectas aleatorias
    for (let j = 0; j < 2 && j < otrasPalabras.length; j++) {
      const opcionIncorrecta = otrasPalabras[j].espanol;
      if (!opciones.includes(opcionIncorrecta)) {
        opciones.push(opcionIncorrecta);
      }
    }
    
    // Si no hay suficientes opciones, agregar opciones genéricas
    while (opciones.length < 3) {
      const opcionGenerica = `Opción ${opciones.length}`;
      if (!opciones.includes(opcionGenerica)) {
        opciones.push(opcionGenerica);
      }
    }
    
    // Mezclar las opciones
    for (let k = opciones.length - 1; k > 0; k--) {
      const j = Math.floor(Math.random() * (k + 1));
      [opciones[k], opciones[j]] = [opciones[j], opciones[k]];
    }
    
    ejercicios.push({
      tipo: "comprension",
      pregunta: `¿Qué significa "${palabra.nahuatl}"?`,
      opciones: opciones,
      respuesta_correcta: palabra.espanol,
      explicacion: `"${palabra.nahuatl}" se traduce como "${palabra.espanol}".`
    });
  }
  
  return ejercicios;
}

// Ejecutar la extracción
const lessons = extractLessons();

if (lessons) {
  // Guardar en archivo JSON
  fs.writeFileSync('lecciones.json', JSON.stringify(lessons, null, 2));
  console.log('✅ Lecciones extraídas exitosamente!');
  console.log(`📚 Total de lecciones: ${lessons.lecciones.length}`);
  
  lessons.lecciones.forEach(leccion => {
    console.log(`- ${leccion.titulo}: ${leccion.palabras.length} palabras, ${leccion.ejercicios.length} ejercicios`);
  });
} else {
  console.error('❌ Error al extraer las lecciones');
}
