# Integración de Componentes en Editor de Lección

## ✅ Componentes Creados

1. **`RecursoForm.tsx`** - Modal para agregar/editar recursos
2. **`QuizForm.tsx`** - Modal para agregar/editar preguntas
3. **`RecursosList.tsx`** - Lista de recursos con CRUD
4. **`QuizList.tsx`** - Lista de preguntas con CRUD

---

## 📝 Pasos para integrar en `editar-leccion/[id]/page.tsx`

### 1. Agregar imports

```typescript
import RecursosList from '@/components/lecciones/RecursosList';
import QuizList from '@/components/lecciones/QuizList';
import { RecursoExterno } from '@/components/lecciones/RecursoForm';
import { QuizPregunta } from '@/components/lecciones/QuizForm';
```

### 2. Agregar estados

```typescript
const [recursos, setRecursos] = useState<RecursoExterno[]>([]);
const [quizPreguntas, setQuizPreguntas] = useState<QuizPregunta[]>([]);
```

### 3. Cargar datos al obtener lección

En la función `fetchLeccion`, después de `setEditData(data.leccion)`:

```typescript
setRecursos(data.leccion.recursos_externos || []);
setQuizPreguntas(data.leccion.quiz_preguntas || []);
```

### 4. Handlers para recursos

```typescript
const handleAddRecurso = (recurso: RecursoExterno) => {
  setRecursos(prev => [...prev, recurso]);
};

const handleUpdateRecurso = (id: string, updated: RecursoExterno) => {
  setRecursos(prev => prev.map(r => r.id === id ? { ...r, ...updated } : r));
};

const handleDeleteRecurso = (id: string) => {
  setRecursos(prev => prev.filter(r => r.id !== id));
};
```

### 5. Handlers para quiz

```typescript
const handleAddPregunta = (pregunta: QuizPregunta) => {
  setQuizPreguntas(prev => [...prev, pregunta]);
};

const handleUpdatePregunta = (id: string, updated: QuizPregunta) => {
  setQuizPreguntas(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
};

const handleDeletePregunta = (id: string) => {
  setQuizPreguntas(prev => prev.filter(p => p.id !== id));
};
```

### 6. Actualizar función de guardado

En `handleSave`, agregar al payload:

```typescript
const payload = {
  ...editData,
  recursos_externos: recursos,
  quiz_preguntas: quizPreguntas
};
```

Y después de guardar exitosamente:

```typescript
if (response.ok) {
  const data = await response.json();
  setLeccion(data.leccion);
  setEditData(data.leccion);
  setRecursos(data.leccion.recursos_externos || []);
  setQuizPreguntas(data.leccion.quiz_preguntas || []);
  // ... resto del código
}
```

### 7. Agregar componentes en el JSX

Después de la sección de objetivos y palabras clave, agregar:

```tsx
{/* Recursos Externos */}
<RecursosList
  recursos={recursos}
  onAdd={handleAddRecurso}
  onUpdate={handleUpdateRecurso}
  onDelete={handleDeleteRecurso}
/>

{/* Quiz */}
<QuizList
  preguntas={quizPreguntas}
  onAdd={handleAddPregunta}
  onUpdate={handleUpdatePregunta}
  onDelete={handleDeletePregunta}
/>
```

---

## 🎯 Resultado Final

Con estos cambios tendrás:

✅ Edición completa de recursos (video, imagen, audio, enlaces)
✅ Edición completa de preguntas de quiz
✅ UI moderna con modales
✅ Validaciones en formularios
✅ Sincronización automática con backend
✅ Componentes reutilizables y mantenibles

---

## 🚀 Siguiente Paso

Una vez integrado, proceder con **FASE 3**: Mejorar estilos de Markdown y Quiz en vista pública.
