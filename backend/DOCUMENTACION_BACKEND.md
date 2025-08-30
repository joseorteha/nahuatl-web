# Documentación Técnica del Backend - Nawatlahtol (Aplicación de Aprendizaje de Náhuatl)

## 📋 Índice
1. [Introducción](#introducción)
2. [Arquitectura y Tecnologías](#arquitectura-y-tecnologías)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Modelo de Datos](#modelo-de-datos)
5. [API Endpoints](#api-endpoints)
6. [Integración con Base de Datos](#integración-con-base-de-datos)
7. [Autenticación y Autorización](#autenticación-y-autorización)
8. [Diccionario y Gestión de Datos](#diccionario-y-gestión-de-datos)
9. [Sistema de Lecciones](#sistema-de-lecciones)
10. [Gestión de Feedback y Comunidad](#gestión-de-feedback-y-comunidad)
11. [Seguridad](#seguridad)
12. [Rendimiento y Optimización](#rendimiento-y-optimización)
13. [Configuración y Variables de Entorno](#configuración-y-variables-de-entorno)
14. [Despliegue](#despliegue)
15. [Monitoreo y Logging](#monitoreo-y-logging)
16. [Guía de Mantenimiento](#guía-de-mantenimiento)

---

## Introducción

El backend de Nawatlahtol es un servidor Express.js que proporciona una API RESTful para soportar la aplicación de aprendizaje de Náhuatl. Su función principal es gestionar los datos del diccionario, lecciones, autenticación de usuarios y retroalimentación de la comunidad.

**Propósito del documento**: Esta documentación técnica proporciona información detallada sobre la arquitectura, endpoints, integración con bases de datos y funcionalidades del backend de la aplicación para desarrolladores, mantenedores y administradores del sistema.

**Público objetivo**: Desarrolladores backend, administradores de sistemas, mantenedores técnicos y colaboradores del proyecto.

---

## Arquitectura y Tecnologías

### Tecnología Principal
- **Node.js**: Entorno de ejecución para JavaScript del lado del servidor.
- **Express.js**: Framework web minimalista para Node.js que facilita la creación de APIs.

### Dependencias Clave
- **@supabase/supabase-js**: Cliente oficial de Supabase para Node.js.
- **cors**: Middleware para habilitar CORS (Cross-Origin Resource Sharing).
- **dotenv**: Carga variables de entorno desde archivos .env.
- **fs (nativo)**: Módulo de sistema de archivos para leer datos JSON locales.
- **path (nativo)**: Utilidades para trabajar con rutas de archivos.

### Patrones Arquitectónicos
- **RESTful API**: Endpoints estructurados siguiendo principios REST.
- **Middleware Pattern**: Uso de middlewares para procesar solicitudes.
- **Repository Pattern**: Encapsulación del acceso a datos (implementado parcialmente).
- **Service Layer**: Separación de lógica de negocio y acceso a datos.

### Flujo de Datos
1. Solicitud HTTP recibida por Express
2. Procesamiento por middlewares (CORS, JSON parsing)
3. Enrutamiento a controlador específico
4. Acceso a datos (Supabase o archivos JSON locales)
5. Procesamiento de lógica de negocio
6. Respuesta al cliente

---

## Estructura del Proyecto

```
backend/
├── data/                # Datos estáticos en formato JSON
│   ├── dictionary.json  # Diccionario Náhuatl-Español
│   ├── lessons.json     # Lecciones y contenido educativo
│   ├── lecciones.json   # Versión en español de las lecciones
│   └── vocabulario.json # Vocabulario por categorías
├── index.js             # Punto de entrada principal
├── package.json         # Dependencias y scripts
├── .env                 # Variables de entorno (no en repositorio)
└── README.md            # Documentación básica
```

> **Nota sobre la estructura**: El backend actualmente sigue un enfoque monolítico con toda la lógica en `index.js`. Una refactorización futura debería considerar una estructura más modular separando rutas, controladores y servicios.

---

## Modelo de Datos

### Tablas en Supabase

#### 1. Perfiles (`profiles`)
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_beta_tester BOOLEAN DEFAULT FALSE,
  feedback_count INTEGER DEFAULT 0
);
```

#### 2. Feedback (`feedback`)
```sql
CREATE TABLE feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT CHECK (category IN ('suggestion', 'bug_report', 'feature_request', 'general')) DEFAULT 'general',
  status TEXT CHECK (status IN ('pending', 'reviewed', 'implemented', 'declined')) DEFAULT 'pending',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 3. Likes de Feedback (`feedback_likes`)
```sql
CREATE TABLE feedback_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  feedback_id UUID REFERENCES feedback(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(feedback_id, user_id)
);
```

#### 4. Respuestas a Feedback (`feedback_replies`) - Tabla inferida
```sql
CREATE TABLE feedback_replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  feedback_id UUID REFERENCES feedback(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 5. Palabras Guardadas (`saved_words`) - Tabla inferida
```sql
CREATE TABLE saved_words (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  dictionary_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, dictionary_id)
);
```

### Esquemas JSON Locales

#### 1. Entrada de Diccionario
```typescript
interface DictionaryEntry {
  id: string;              // Identificador único
  word: string;            // Palabra en náhuatl
  variants: string[];      // Variantes dialectales
  grammar_info: string;    // Información gramatical
  definition: string;      // Definición en español
  scientific_name?: string; // Nombre científico (para flora/fauna)
  examples?: {             // Ejemplos de uso
    nahuatl: string;
    espanol: string;
  }[];
  synonyms?: string[];     // Sinónimos
  roots?: string[];        // Raíces etimológicas
  see_also?: string[];     // Referencias cruzadas
  alt_spellings?: string[]; // Ortografías alternativas
  notes?: string[];        // Notas culturales o contextuales
}
```

#### 2. Lección
```typescript
interface Lesson {
  id: string;              // Identificador único
  slug: string;            // Slug para URL
  title: string;           // Título de la lección
  description: string;     // Descripción breve
  level: string;           // Nivel (beginner, intermediate, advanced)
  topics: string[];        // Temas cubiertos
  content: {               // Contenido estructurado
    sections: {
      title: string;
      type: string;        // text, grammar, vocabulary, exercise
      content: string;     // Markdown o contenido estructurado
    }[];
  };
  quiz: {                  // Cuestionario de práctica
    questions: {
      question: string;
      options: string[];
      answer: string;
    }[];
  };
}
```

---

## API Endpoints

### Endpoints de Diccionario

#### `GET /api/dictionary/search`
- **Propósito**: Buscar términos en el diccionario náhuatl-español.
- **Parámetros de consulta**:
  - `q` (string): Término de búsqueda.
- **Respuesta exitosa**:
  - Código: 200 OK
  - Cuerpo: Array de entradas del diccionario ordenadas por relevancia.
- **Implementación**:
  - Lee `dictionary.json` usando `fs`.
  - Filtra y puntúa resultados según coincidencia.
  - Ordena por puntuación y devuelve resultados.
- **Ejemplo de respuesta**:
  ```json
  [
    {
      "id": "word123",
      "word": "cihuatl",
      "variants": ["sihuatl"],
      "grammar_info": "sustantivo",
      "definition": "mujer",
      "examples": [
        {
          "nahuatl": "In cihuatl cualli tlacua",
          "espanol": "La mujer come bien"
        }
      ],
      "score": 100
    }
  ]
  ```

#### `GET /api/dictionary/saved/:uid`
- **Propósito**: Obtener palabras guardadas por un usuario.
- **Parámetros de ruta**:
  - `uid` (string): ID del usuario.
- **Respuesta exitosa**:
  - Código: 200 OK
  - Cuerpo: Array de IDs de palabras guardadas.
- **Ejemplo de respuesta**:
  ```json
  ["word123", "word456", "word789"]
  ```

#### `POST /api/dictionary/save`
- **Propósito**: Guardar una palabra en favoritos del usuario.
- **Cuerpo de solicitud**:
  ```json
  {
    "user_id": "user123",
    "dictionary_id": "word123"
  }
  ```
- **Respuesta exitosa**:
  - Código: 200 OK
  - Cuerpo: Objeto con mensaje de éxito.
- **Respuesta de error**:
  - Código: 400 Bad Request
  - Cuerpo: `{ "error": "La palabra ya está guardada" }`

#### `DELETE /api/dictionary/save`
- **Propósito**: Eliminar una palabra guardada.
- **Cuerpo de solicitud**:
  ```json
  {
    "user_id": "user123",
    "dictionary_id": "word123"
  }
  ```
- **Respuesta exitosa**:
  - Código: 200 OK
  - Cuerpo: Objeto con mensaje de éxito.

### Endpoints de Lecciones

#### `GET /api/lessons`
- **Propósito**: Obtener lista de todas las lecciones disponibles.
- **Respuesta exitosa**:
  - Código: 200 OK
  - Cuerpo: Array de lecciones (sin contenido completo).
- **Implementación**:
  - Lee `lessons.json` usando `fs`.
  - Filtra para incluir solo metadata (sin contenido completo).
- **Ejemplo de respuesta**:
  ```json
  [
    {
      "id": "lesson1",
      "slug": "saludos-y-presentaciones",
      "title": "Saludos y Presentaciones",
      "description": "Aprende a saludar y presentarte en náhuatl"
    }
  ]
  ```

#### `GET /api/lessons/:slug`
- **Propósito**: Obtener una lección específica con contenido completo.
- **Parámetros de ruta**:
  - `slug` (string): Slug identificador de la lección.
- **Respuesta exitosa**:
  - Código: 200 OK
  - Cuerpo: Objeto lección completo con todo su contenido.
- **Respuesta de error**:
  - Código: 404 Not Found
  - Cuerpo: "Lección no encontrada."

### Endpoints de Práctica

#### `GET /api/practice/quiz`
- **Propósito**: Generar un quiz aleatorio basado en el diccionario.
- **Respuesta exitosa**:
  - Código: 200 OK
  - Cuerpo: Array de preguntas de quiz con opciones.
- **Implementación**:
  - Lee `dictionary.json`.
  - Selecciona entradas válidas para quiz.
  - Genera preguntas con respuesta correcta y distractores.
- **Ejemplo de respuesta**:
  ```json
  [
    {
      "question": "cihuatl",
      "options": ["mujer", "hombre", "niño", "anciano"],
      "answer": "mujer"
    }
  ]
  ```

### Endpoints de Autenticación

#### `POST /api/register`
- **Propósito**: Registrar un nuevo usuario.
- **Cuerpo de solicitud**:
  ```json
  {
    "email": "usuario@ejemplo.com",
    "username": "usuario123",
    "password": "contraseña",
    "full_name": "Nombre Completo"
  }
  ```
- **Respuesta exitosa**:
  - Código: 200 OK
  - Cuerpo: Datos del usuario creado (sin contraseña).
- **Respuestas de error**:
  - Código: 400 Bad Request - "Faltan campos requeridos."
  - Código: 409 Conflict - "El email o usuario ya está registrado."
  - Código: 500 Internal Server Error - Detalles del error.

#### `POST /api/login`
- **Propósito**: Autenticar un usuario existente.
- **Cuerpo de solicitud**:
  ```json
  {
    "emailOrUsername": "usuario@ejemplo.com",
    "password": "contraseña"
  }
  ```
- **Respuesta exitosa**:
  - Código: 200 OK
  - Cuerpo: Datos del usuario autenticado (sin contraseña).
- **Respuestas de error**:
  - Código: 400 Bad Request - "Faltan campos requeridos."
  - Código: 401 Unauthorized - "Credenciales incorrectas."
  - Código: 500 Internal Server Error - Detalles del error.

### Endpoints de Feedback

#### `POST /api/feedback`
- **Propósito**: Crear un nuevo comentario o sugerencia.
- **Cuerpo de solicitud**:
  ```json
  {
    "user_id": "user123",
    "title": "Sugerencia para mejorar",
    "content": "Me gustaría ver más ejemplos en las lecciones",
    "category": "suggestion",
    "priority": "medium"
  }
  ```
- **Respuesta exitosa**:
  - Código: 201 Created
  - Cuerpo: Objeto feedback creado.
- **Respuestas de error**:
  - Código: 400 Bad Request - "Faltan campos requeridos."
  - Código: 500 Internal Server Error - Detalles del error.

#### `GET /api/feedback`
- **Propósito**: Obtener todos los comentarios con sus detalles.
- **Respuesta exitosa**:
  - Código: 200 OK
  - Cuerpo: Array de objetos feedback con detalles.
- **Implementación**:
  - Consulta a Supabase con join a perfiles y respuestas.
  - Ordena por fecha de creación.
- **Ejemplo de respuesta**:
  ```json
  [
    {
      "id": "feedback123",
      "title": "Sugerencia para mejorar",
      "content": "Me gustaría ver más ejemplos en las lecciones",
      "category": "suggestion",
      "status": "pending",
      "priority": "medium",
      "likes_count": 5,
      "created_at": "2025-08-01T12:00:00Z",
      "profiles": {
        "full_name": "Nombre Usuario",
        "username": "usuario123"
      },
      "feedback_replies": [
        {
          "id": "reply123",
          "content": "Gracias por tu sugerencia",
          "created_at": "2025-08-02T12:00:00Z"
        }
      ]
    }
  ]
  ```

---

## Integración con Base de Datos

### Supabase

El backend utiliza Supabase como base de datos principal para almacenar información de usuarios, comentarios y datos relacionados con la interacción del usuario.

#### Configuración de Supabase

```javascript
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://aiqitkcpdwdbdbeavyys.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'TU_SERVICE_ROLE_KEY_AQUI';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
```

#### Patrones de Uso

1. **Consultas Simples**:
   ```javascript
   const { data, error } = await supabase
     .from('profiles')
     .select('*')
     .or(`email.eq.${emailOrUsername},username.eq.${emailOrUsername}`)
     .maybeSingle();
   ```

2. **Inserciones**:
   ```javascript
   const { data, error } = await supabase
     .from('feedback')
     .insert({ user_id, title, content, category, priority })
     .select();
   ```

3. **Consultas con Join**:
   ```javascript
   const { data, error } = await supabase
     .from('feedback')
     .select(`
       *,
       profiles (full_name, username),
       feedback_replies (
         id,
         content,
         created_at
       )
     `)
     .order('created_at', { ascending: false });
   ```

### Archivos JSON Locales

El backend también utiliza archivos JSON locales para datos estáticos como el diccionario y las lecciones.

#### Acceso a Datos JSON

```javascript
const dictionaryPath = path.join(__dirname, 'data', 'dictionary.json');
const lessonsPath = path.join(__dirname, 'data', 'lessons.json');

fs.readFile(dictionaryPath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading dictionary data:', err);
    return res.status(500).send('Error al leer los datos del diccionario.');
  }
  const dictionary = JSON.parse(data);
  // Procesar datos...
});
```

#### Ventajas y Desventajas

**Ventajas**:
- Acceso rápido sin latencia de red
- No requiere conexión a base de datos
- Fácil de modificar para administradores

**Desventajas**:
- No escala bien para datos muy grandes
- No permite actualizaciones en tiempo real
- Limitaciones para búsquedas complejas

**Plan de Migración Futuro**:
En futuras versiones, se contempla migrar los datos de diccionario y lecciones a Supabase para centralizar todo el almacenamiento y mejorar la escalabilidad.

---

## Autenticación y Autorización

### Sistema Actual

El backend implementa un sistema de autenticación básico utilizando Supabase para almacenar credenciales de usuario.

#### Proceso de Registro
1. Validación de datos de entrada (email, username, password)
2. Verificación de existencia previa del usuario
3. Almacenamiento de credenciales en tabla `profiles`
4. Retorno de datos de usuario (sin contraseña)

#### Proceso de Login
1. Búsqueda de usuario por email o username
2. Comparación directa de contraseña
3. Generación de sesión (datos almacenados en cliente)
4. Retorno de datos de usuario (sin contraseña)

### Limitaciones y Áreas de Mejora

El sistema actual tiene varias limitaciones de seguridad que deben abordarse:

1. **Almacenamiento de Contraseñas**:
   - Actualmente las contraseñas se almacenan en texto plano
   - Mejora: Implementar hashing con bcrypt o Argon2

2. **Manejo de Sesiones**:
   - No hay tokens JWT ni manejo de expiración
   - Mejora: Implementar autenticación basada en tokens con expiración

3. **Autorización**:
   - No hay sistema de roles o permisos
   - Mejora: Implementar RBAC (Control de Acceso Basado en Roles)

4. **Seguridad General**:
   - No hay protección contra ataques de fuerza bruta
   - Mejora: Implementar rate limiting y bloqueo temporal

### Roadmap de Seguridad

Para futuras versiones, se recomienda:

1. Migrar a Auth de Supabase completamente
2. Implementar autenticación social (Google, Facebook)
3. Añadir verificación de email
4. Implementar recuperación de contraseña
5. Establecer roles (usuario, editor, admin)

---

## Diccionario y Gestión de Datos

### Estructura del Diccionario

El diccionario es un componente central de la aplicación, almacenado en `data/dictionary.json`. Contiene una colección de entradas náhuatl-español con información detallada.

#### Características del Diccionario
- Aproximadamente 5,000 entradas
- Información gramatical y etimológica
- Ejemplos de uso con traducción
- Referencias cruzadas entre términos
- Notas culturales y contextuales

### Sistema de Búsqueda

El sistema implementa una búsqueda avanzada con ponderación:

```javascript
const scoredResults = dictionary
  .map(entry => {
    let score = 0;
    const word = entry.word.toLowerCase();
    
    // Prioritize exact matches and then starting matches
    if (word === lowerQuery) score = 100;
    else if (word.startsWith(lowerQuery)) score = Math.max(score, 90);

    // Score matches in other fields
    if (entry.variants && entry.variants.some(v => v.toLowerCase().includes(lowerQuery))) score = Math.max(score, 80);
    if (entry.synonyms && entry.synonyms.some(s => s.toLowerCase().includes(lowerQuery))) score = Math.max(score, 70);
    if (entry.roots && entry.roots.some(r => r.toLowerCase().includes(lowerQuery))) score = Math.max(score, 60);
    if (word.includes(lowerQuery)) score = Math.max(score, 50);
    if (entry.definition && entry.definition.toLowerCase().includes(lowerQuery)) score = Math.max(score, 10);

    return { ...entry, score };
  })
  .filter(entry => entry.score > 0)
  .sort((a, b) => b.score - a.score);
```

#### Algoritmo de Puntuación
- **100 puntos**: Coincidencia exacta con la palabra
- **90 puntos**: La palabra comienza con la consulta
- **80 puntos**: Coincidencia en variantes dialectales
- **70 puntos**: Coincidencia en sinónimos
- **60 puntos**: Coincidencia en raíces etimológicas
- **50 puntos**: La consulta está contenida en la palabra
- **10 puntos**: Coincidencia en la definición

### Palabras Guardadas

El sistema permite a los usuarios guardar palabras favoritas:

1. **Guardar Palabra**:
   - Endpoint: `POST /api/dictionary/save`
   - Almacena la relación usuario-palabra en Supabase
   - Previene duplicados

2. **Obtener Guardadas**:
   - Endpoint: `GET /api/dictionary/saved/:uid`
   - Recupera todas las palabras guardadas por un usuario

3. **Eliminar Guardada**:
   - Endpoint: `DELETE /api/dictionary/save`
   - Elimina la relación usuario-palabra

---

## Sistema de Lecciones

### Estructura de Lecciones

Las lecciones están almacenadas en `data/lessons.json` y proporcionan contenido educativo estructurado para aprender náhuatl.

#### Componentes de una Lección
- **Metadata**: ID, título, descripción, nivel
- **Contenido**: Secciones con teoría, gramática, vocabulario
- **Ejercicios**: Actividades prácticas
- **Quiz**: Cuestionario para evaluar conocimientos

### API de Lecciones

El backend proporciona dos endpoints principales:

1. **Listar Lecciones**:
   ```javascript
   app.get('/api/lessons', (req, res) => {
     fs.readFile(lessonsPath, 'utf8', (err, data) => {
       if (err) {
         console.error('Error reading lessons data:', err);
         return res.status(500).send('Error al leer los datos de las lecciones.');
       }
       const lessons = JSON.parse(data);
       // Devolvemos solo los campos necesarios para la lista
       const lessonsList = lessons.map(({ id, slug, title, description }) => ({ id, slug, title, description }));
       res.json(lessonsList);
     });
   });
   ```

2. **Obtener Lección Específica**:
   ```javascript
   app.get('/api/lessons/:slug', (req, res) => {
     fs.readFile(lessonsPath, 'utf8', (err, data) => {
       if (err) {
         console.error('Error reading lesson data:', err);
         return res.status(500).send('Error al leer los datos de la lección.');
       }
       const lessons = JSON.parse(data);
       const lesson = lessons.find(l => l.slug === req.params.slug);
       if (!lesson) {
         return res.status(404).send('Lección no encontrada.');
       }
       res.json(lesson);
     });
   });
   ```

### Sistema de Quiz

El sistema puede generar quizzes dinámicos basados en el contenido del diccionario:

```javascript
app.get('/api/practice/quiz', (req, res) => {
  fs.readFile(dictionaryPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading dictionary for quiz:', err);
      return res.status(500).send('Error al generar el quiz.');
    }

    const dictionary = JSON.parse(data);
    const quizSize = 10; // Número de preguntas en el quiz

    // Filtrar entradas que sean buenas candidatas para un quiz
    const validEntries = dictionary.filter(entry => entry.definition && !entry.definition.includes(';') && !entry.definition.includes('('));
    
    const selectedEntries = shuffleArray(validEntries).slice(0, quizSize);

    const quiz = selectedEntries.map(correctEntry => {
      // Obtener 3 distractores aleatorios
      const distractors = shuffleArray(validEntries)
        .filter(d => d.word !== correctEntry.word) 
        .slice(0, 3)
        .map(d => d.definition.split(',')[0].trim());

      const options = shuffleArray([
        ...distractors, 
        correctEntry.definition.split(',')[0].trim()
      ]);

      return {
        question: correctEntry.word,
        options: options,
        answer: correctEntry.definition.split(',')[0].trim()
      };
    });

    res.json(quiz);
  });
});
```

---

## Gestión de Feedback y Comunidad

### Sistema de Retroalimentación

El backend proporciona un sistema completo para que los usuarios envíen comentarios, sugerencias y reportes de errores.

#### Características Principales
- Categorización de comentarios (sugerencia, error, característica)
- Sistema de prioridades (baja, media, alta, crítica)
- Estados de seguimiento (pendiente, revisado, implementado, rechazado)
- Sistema de "me gusta" para votación comunitaria
- Respuestas de administradores

### Endpoints de Feedback

#### Crear Feedback
```javascript
app.post('/api/feedback', async (req, res) => {
  const { user_id, title, content, category, priority } = req.body;

  if (!user_id || !title || !content) {
    return res.status(400).json({ error: 'Faltan campos requeridos.' });
  }

  try {
    const { data, error } = await supabase
      .from('feedback')
      .insert({ user_id, title, content, category, priority })
      .select();

    if (error) {
      console.error('Supabase error al crear feedback:', error);
      return res.status(500).json({ error: 'Error al crear la sugerencia.', details: error.message });
    }

    res.status(201).json(data);
  } catch (e) {
    console.error('Error inesperado en /api/feedback:', e);
    return res.status(500).json({ error: 'Error inesperado en el servidor.', details: e.message });
  }
});
```

#### Obtener Feedback
```javascript
app.get('/api/feedback', async (req, res) => {
  try {
    console.log('Obteniendo feedbacks...');
    
    const { data, error } = await supabase
      .from('feedback')
      .select(`
        *,
        profiles (full_name, username),
        feedback_replies (
          id,
          content,
          created_at,
          user_id,
          profiles (full_name, username)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error al obtener feedback:', error);
      return res.status(500).json({ error: 'Error al obtener las sugerencias.', details: error.message });
    }

    res.json(data);
  } catch (e) {
    console.error('Error inesperado en GET /api/feedback:', e);
    return res.status(500).json({ error: 'Error inesperado en el servidor.', details: e.message });
  }
});
```

### Funcionalidades Adicionales (a implementar)

1. **Sistema de Comentarios en Lecciones**:
   - Permitir discusiones en contenido educativo
   - Resolver dudas comunitariamente

2. **Contribuciones al Diccionario**:
   - Permitir a usuarios proponer nuevas entradas
   - Sistema de revisión por moderadores

3. **Foros Temáticos**:
   - Espacios de discusión por categorías
   - Intercambio de recursos adicionales

---

## Seguridad

### Prácticas de Seguridad Actuales

1. **Validación de Datos**:
   - Verificación de campos requeridos
   - Validación de formato de email

2. **Manejo de Errores**:
   - Captura estructurada de errores
   - Mensajes de error informativos pero seguros

3. **Logs de Depuración**:
   - Registro de eventos críticos
   - Información para debugging

### Áreas de Mejora

1. **Autenticación**:
   - Implementar hashing de contraseñas
   - Añadir tokens JWT con expiración
   - Implementar refresh tokens

2. **Protección de Endpoints**:
   - Middleware de autenticación
   - Validación de permisos por ruta

3. **Validación de Datos**:
   - Implementar validación más rigurosa (joi, zod)
   - Sanitizar inputs para prevenir XSS/SQLi

4. **Rate Limiting**:
   - Limitar intentos de login
   - Proteger endpoints sensibles

### Recomendaciones de Implementación

```javascript
// Ejemplo: Middleware de autenticación
const authenticateUser = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No autorizado. Token no proporcionado.' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado.' });
  }
};

// Aplicar a rutas protegidas
app.get('/api/protected-route', authenticateUser, (req, res) => {
  // Lógica de la ruta protegida
});
```

---

## Rendimiento y Optimización

### Estrategias de Optimización Actuales

1. **Búsqueda Eficiente**:
   - Sistema de puntuación para resultados relevantes
   - Filtrado temprano de resultados irrelevantes

2. **Respuestas Parciales**:
   - Envío de metadatos sin contenido completo cuando es apropiado
   - Carga progresiva de datos grandes

### Optimizaciones Recomendadas

1. **Caché de Resultados**:
   ```javascript
   // Implementación simple de caché
   const cache = {};
   
   app.get('/api/dictionary/search', (req, res) => {
     const query = req.query.q?.toLowerCase() || '';
     
     // Verificar caché
     const cacheKey = `search_${query}`;
     if (cache[cacheKey]) {
       return res.json(cache[cacheKey]);
     }
     
     // Búsqueda normal...
     
     // Almacenar en caché
     cache[cacheKey] = results;
     setTimeout(() => delete cache[cacheKey], 3600000); // Expirar en 1 hora
     
     res.json(results);
   });
   ```

2. **Paginación**:
   ```javascript
   app.get('/api/dictionary/search', (req, res) => {
     const query = req.query.q?.toLowerCase() || '';
     const page = parseInt(req.query.page) || 1;
     const limit = parseInt(req.query.limit) || 20;
     
     // Búsqueda normal...
     
     // Aplicar paginación
     const startIndex = (page - 1) * limit;
     const endIndex = page * limit;
     const paginatedResults = results.slice(startIndex, endIndex);
     
     res.json({
       results: paginatedResults,
       pagination: {
         total: results.length,
         pages: Math.ceil(results.length / limit),
         currentPage: page
       }
     });
   });
   ```

3. **Optimización de Carga de Archivos**:
   - Cargar archivos JSON en memoria al inicio
   - Refrescar periódicamente para cambios

4. **Compresión de Respuestas**:
   ```javascript
   const compression = require('compression');
   app.use(compression()); // Comprimir todas las respuestas
   ```

5. **Índices para Búsqueda Rápida**:
   - Implementar estructuras de datos optimizadas para búsqueda
   - Considerar bases de datos de búsqueda especializadas (Elasticsearch)

---

## Configuración y Variables de Entorno

### Variables de Entorno Requeridas

El backend utiliza las siguientes variables de entorno:

```
PORT=3001                           # Puerto para el servidor Express
SUPABASE_URL=https://example.supabase.co  # URL de la instancia de Supabase
SUPABASE_SERVICE_KEY=your-key-here  # Clave de servicio de Supabase
```

### Carga de Variables

El backend utiliza `dotenv` para cargar variables de entorno:

```javascript
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://aiqitkcpdwdbdbeavyys.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'TU_SERVICE_ROLE_KEY_AQUI';
```

### Buenas Prácticas

1. **Nunca comprometer claves**: No incluir .env en control de versiones
2. **Valores por defecto seguros**: Proporcionar defaults solo para desarrollo
3. **Validación de variables**: Verificar existencia de variables críticas
4. **Documentación**: Mantener archivo .env.example actualizado

### Ejemplo de .env.example
```
# Puerto del servidor
PORT=3001

# Configuración de Supabase
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_KEY=tu_clave_de_servicio

# Configuración de Seguridad
JWT_SECRET=un_secreto_largo_y_aleatorio
JWT_EXPIRY=24h

# Configuración de Entorno
NODE_ENV=development
```

---

## Despliegue

### Configuración Actual

- **Plataforma**: Render
- **URL**: https://nahuatl-web.onrender.com
- **Tipo de Despliegue**: Web Service
- **Entorno**: Node.js

### Proceso de Despliegue

1. **Construcción**:
   - Comando: `npm install`
   - Tiempo típico: 1-2 minutos

2. **Ejecución**:
   - Comando: `node index.js`
   - Puerto: Determinado por variable de entorno

3. **Configuración**:
   - Variables de entorno configuradas en dashboard de Render
   - Escalado automático deshabilitado (plan gratuito)

### Recomendaciones para Producción

1. **Process Manager**:
   - Implementar PM2 para gestión de procesos
   - Configurar reinicio automático

2. **Logs**:
   - Integrar sistema de logging externo
   - Implementar rotación de logs

3. **Monitoreo**:
   - Implementar healthchecks
   - Configurar alertas de disponibilidad

4. **Escalabilidad**:
   - Migrar a arquitectura de microservicios
   - Implementar balanceador de carga

---

## Monitoreo y Logging

### Sistema de Logging Actual

El backend utiliza `console.log` y `console.error` para registrar eventos:

```javascript
console.log('Intento de login para:', emailOrUsername);
console.error('Supabase error al buscar usuario en login:', error);
```

### Mejoras Recomendadas

1. **Implementar Logger Estructurado**:
   ```javascript
   const winston = require('winston');
   
   const logger = winston.createLogger({
     level: 'info',
     format: winston.format.json(),
     transports: [
       new winston.transports.File({ filename: 'error.log', level: 'error' }),
       new winston.transports.File({ filename: 'combined.log' })
     ]
   });
   
   if (process.env.NODE_ENV !== 'production') {
     logger.add(new winston.transports.Console({
       format: winston.format.simple()
     }));
   }
   
   // Uso
   logger.info('Usuario logueado', { userId: user.id, email: user.email });
   logger.error('Error en login', { error: error.message, stack: error.stack });
   ```

2. **Monitoreo de Salud**:
   ```javascript
   app.get('/health', (req, res) => {
     const healthcheck = {
       uptime: process.uptime(),
       message: 'OK',
       timestamp: Date.now()
     };
     res.json(healthcheck);
   });
   ```

3. **Métricas de Rendimiento**:
   ```javascript
   const responseTime = require('response-time');
   
   app.use(responseTime((req, res, time) => {
     logger.info('Tiempo de respuesta', {
       method: req.method,
       url: req.url,
       time: time
     });
   }));
   ```

4. **Integración con Servicios Externos**:
   - Sentry para tracking de errores
   - Datadog o New Relic para monitoreo de rendimiento
   - Loggly o Papertrail para gestión centralizada de logs

---

## Guía de Mantenimiento

### Actualización de Datos

#### Diccionario

Para actualizar el diccionario:

1. Editar archivo `data/dictionary.json`
2. Seguir estructura existente de objetos
3. Reiniciar el servidor para reflejar cambios

Ejemplo de nueva entrada:
```json
{
  "id": "new_word_123",
  "word": "xochitl",
  "variants": ["sochitl"],
  "grammar_info": "sustantivo",
  "definition": "flor",
  "examples": [
    {
      "nahuatl": "In xochitl cenca cualtzin",
      "espanol": "La flor es muy bonita"
    }
  ],
  "roots": ["xochi", "tl"],
  "notes": ["Palabra muy común en nombres propios y toponimios"]
}
```

#### Lecciones

Para actualizar lecciones:

1. Editar archivo `data/lessons.json`
2. Seguir estructura existente de objetos
3. Reiniciar el servidor para reflejar cambios

### Mantenimiento Rutinario

1. **Backups**:
   - Exportar datos de Supabase semanalmente
   - Mantener copias de archivos JSON

2. **Actualizaciones**:
   - Revisar dependencias con `npm outdated`
   - Actualizar paquetes con `npm update`
   - Probar cambios en entorno de desarrollo

3. **Monitoreo**:
   - Revisar logs periódicamente
   - Verificar uso de recursos

### Resolución de Problemas Comunes

1. **Servidor no arranca**:
   - Verificar variables de entorno
   - Comprobar conexión a Supabase
   - Revisar logs de errores

2. **Errores en endpoints**:
   - Verificar formato de datos JSON
   - Comprobar permisos en Supabase
   - Revisar estructura de consultas

3. **Rendimiento lento**:
   - Monitorear tiempos de respuesta
   - Verificar tamaño de archivos JSON
   - Optimizar consultas a Supabase

---

## Contacto y Soporte

- **Mantenedor Principal**: José Ortega
- **Repositorio**: [GitHub - nahuatl-web](https://github.com/joseorteha/nahuatl-web)
- **Reportar Problemas**: Sección de Issues en GitHub

---

*Documentación generada el 30 de agosto de 2025*

*Última actualización: 30 de agosto de 2025*
