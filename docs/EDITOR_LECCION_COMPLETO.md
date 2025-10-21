# FASE 2 - Implementación Completa

## ✅ Backend COMPLETADO

El archivo `backend/src/controllers/leccionesController.js` ya fue actualizado con:

- ✅ Sincronización completa de `recursos_externos` (crear, actualizar, eliminar)
- ✅ Sincronización completa de `quiz_preguntas` (crear, actualizar, eliminar)
- ✅ Soporte para todos los campos: `tipo_recurso`, `duracion_segundos`, `es_opcional`, etc.
- ✅ Logs detallados para debugging

**Reinicia el backend** para que los cambios tomen efecto:
```bash
cd backend
npm start
```

---

## 📝 Frontend - Próximos pasos

Debido a la extensión del código del editor (más de 500 líneas), te recomiendo:

### Opción 1: Copiar componentes de crear-leccion
Puedes reutilizar las secciones de recursos y quiz de `crear-leccion/page.tsx` y adaptarlas al editor.

### Opción 2: Implementación manual guiada
Te guío paso a paso para agregar cada sección.

---

## 🎯 Lo que necesitas agregar al editor

### 1. Interfaces y tipos
```typescript
interface RecursoExterno {
  id?: string;
  tipo_recurso: 'video_youtube' | 'imagen_drive' | 'audio_externo' | 'enlace_web';
  titulo: string;
  descripcion?: string;
  url: string;
  es_opcional: boolean;
  duracion_segundos?: number;
  orden_visualizacion: number;
}

interface QuizPregunta {
  id?: string;
  pregunta: string;
  tipo_pregunta: 'multiple_choice' | 'verdadero_falso' | 'completar_texto';
  opciones: any;
  respuesta_correcta: string;
  explicacion?: string;
  puntos: number;
  orden_pregunta: number;
}
```

### 2. Estados adicionales
```typescript
const [recursos, setRecursos] = useState<RecursoExterno[]>([]);
const [quizPreguntas, setQuizPreguntas] = useState<QuizPregunta[]>([]);
const [showRecursoModal, setShowRecursoModal] = useState(false);
const [showQuizModal, setShowQuizModal] = useState(false);
const [editingRecurso, setEditingRecurso] = useState<RecursoExterno | null>(null);
const [editingPregunta, setEditingPregunta] = useState<QuizPregunta | null>(null);
```

### 3. Cargar recursos y quiz al obtener lección
```typescript
const fetchLeccion = async () => {
  // ... código existente ...
  const data = await response.json();
  setLeccion(data.leccion);
  setEditData(data.leccion);
  
  // AGREGAR ESTAS LÍNEAS:
  setRecursos(data.leccion.recursos_externos || []);
  setQuizPreguntas(data.leccion.quiz_preguntas || []);
};
```

### 4. Función de guardado actualizada
```typescript
const handleSave = async () => {
  setIsSubmitting(true);
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const token = localStorage.getItem('auth_tokens') 
      ? JSON.parse(localStorage.getItem('auth_tokens') || '{}').accessToken 
      : null;
    
    const payload = {
      ...editData,
      recursos_externos: recursos,  // AGREGAR
      quiz_preguntas: quizPreguntas  // AGREGAR
    };
    
    const response = await fetch(`${API_URL}/api/lecciones/${leccionId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (response.ok) {
      const data = await response.json();
      setLeccion(data.leccion);
      setEditData(data.leccion);
      setRecursos(data.leccion.recursos_externos || []);
      setQuizPreguntas(data.leccion.quiz_preguntas || []);
      setSuccessMessage('✅ Lección actualizada');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  } catch (error) {
    setErrorMessage('❌ Error al guardar');
  } finally {
    setIsSubmitting(false);
  }
};
```

### 5. Handlers para recursos
```typescript
const addRecurso = (recurso: RecursoExterno) => {
  setRecursos(prev => [...prev, {
    ...recurso,
    id: recurso.id || `temp-${Date.now()}`,
    orden_visualizacion: prev.length + 1
  }]);
};

const updateRecurso = (id: string, updated: Partial<RecursoExterno>) => {
  setRecursos(prev => prev.map(r => 
    r.id === id ? { ...r, ...updated } : r
  ));
};

const removeRecurso = (id: string) => {
  setRecursos(prev => prev.filter(r => r.id !== id));
};
```

### 6. Handlers para quiz
```typescript
const addPregunta = (pregunta: QuizPregunta) => {
  setQuizPreguntas(prev => [...prev, {
    ...pregunta,
    id: pregunta.id || `temp-${Date.now()}`,
    orden_pregunta: prev.length + 1
  }]);
};

const updatePregunta = (id: string, updated: Partial<QuizPregunta>) => {
  setQuizPreguntas(prev => prev.map(p => 
    p.id === id ? { ...p, ...updated } : p
  ));
};

const removePregunta = (id: string) => {
  setQuizPreguntas(prev => prev.filter(p => p.id !== id));
};
```

---

## 🎨 UI Components necesarios

### Sección de Recursos
```tsx
<div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-xl font-bold">📦 Recursos Externos</h3>
    <button 
      onClick={() => setShowRecursoModal(true)}
      className="px-4 py-2 bg-cyan-500 text-white rounded-lg"
    >
      + Agregar Recurso
    </button>
  </div>
  
  <div className="space-y-3">
    {recursos.map((recurso, index) => (
      <div key={recurso.id} className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
        <div className="flex-1">
          <p className="font-semibold">{recurso.titulo}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {recurso.tipo_recurso} • {recurso.es_opcional ? 'Opcional' : 'Obligatorio'}
          </p>
        </div>
        <button onClick={() => {
          setEditingRecurso(recurso);
          setShowRecursoModal(true);
        }}>
          <Edit size={16} />
        </button>
        <button onClick={() => removeRecurso(recurso.id!)}>
          <Trash2 size={16} />
        </button>
      </div>
    ))}
  </div>
</div>
```

### Sección de Quiz
```tsx
<div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-xl font-bold">❓ Preguntas de Quiz</h3>
    <button 
      onClick={() => setShowQuizModal(true)}
      className="px-4 py-2 bg-purple-500 text-white rounded-lg"
    >
      + Agregar Pregunta
    </button>
  </div>
  
  <div className="space-y-3">
    {quizPreguntas.map((pregunta, index) => (
      <div key={pregunta.id} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="font-semibold">{index + 1}. {pregunta.pregunta}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {pregunta.tipo_pregunta} • {pregunta.puntos} puntos
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => {
              setEditingPregunta(pregunta);
              setShowQuizModal(true);
            }}>
              <Edit size={16} />
            </button>
            <button onClick={() => removePregunta(pregunta.id!)}>
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
</div>
```

---

## ⚡ Siguiente paso

¿Quieres que:
1. **Te genere el archivo completo** del editor con todo integrado?
2. **Te guíe paso a paso** para que lo hagas tú mismo?
3. **Creemos componentes reutilizables** (RecursoForm, QuizForm) primero?

Dime cómo prefieres proceder y continúo con la implementación.
