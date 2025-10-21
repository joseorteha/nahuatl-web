# 📚 Guía de Uso - Sistema de Lecciones Mejorado

## 🎉 ¡Sistema 100% Integrado y Funcional!

---

## 🚀 **Cómo Usar el Sistema**

### **Para Profesores:**

#### **1. Acceder a la Gestión de Lecciones**

```
1. Inicia sesión como profesor
2. Ve a "Mis Cursos"
3. Selecciona un curso
4. Click en "Gestionar Módulos"
5. En cada módulo verás el botón "Gestionar Lecciones"
6. Click en "Gestionar Lecciones"
```

#### **2. Agregar una Lección al Módulo**

Una vez en la página del módulo:

```
1. Click en el botón "➕ Agregar Lección"
2. Se abre un modal con 2 opciones:
```

##### **Opción A: Vincular Lección Existente** 🔗

```
1. Tab "Vincular Lección Existente"
2. Usa el buscador para encontrar lecciones:
   - Busca por nombre
   - Filtra por categoría
   - Filtra por nivel
3. Verás información de cada lección:
   - Título y descripción
   - Categoría y nivel
   - Duración estimada
   - Puntuación promedio
   - Número de estudiantes que la completaron
4. Click en "Vincular" en la lección que quieras
5. ✅ La lección se agrega al módulo
```

**Ventajas:**
- ✅ Reutilizas contenido existente
- ✅ La lección puede usarse en múltiples módulos
- ✅ Aparece en el catálogo público `/lecciones`

##### **Opción B: Crear Lección Exclusiva** ✨

```
1. Tab "Crear Lección Exclusiva"
2. Llena el formulario:
   
   📝 Información Básica:
   - Título (requerido)
   - Descripción
   - Categoría (requerido)
   - Nivel (requerido)
   - Duración estimada (minutos)
   
   📖 Contenido:
   - Contenido en Español (mínimo 50 caracteres)
   - Contenido en Náhuatl (opcional)
   
   🎯 Objetivos de Aprendizaje:
   - Agrega objetivos (click "+ Agregar objetivo")
   - Puedes agregar múltiples
   
   🏷️ Palabras Clave:
   - Agrega palabras clave (click "+ Agregar palabra")
   - Ayudan a categorizar la lección
   
   ⚙️ Configuración:
   - ☑️ Lección obligatoria (checkbox)

3. Click en "Crear Lección Exclusiva"
4. ✅ La lección se crea y vincula automáticamente
```

**Ventajas:**
- ✅ Contenido único para este módulo
- ✅ No aparece en el catálogo público
- ✅ Se elimina si eliminas el módulo
- ✅ Perfecto para introducciones o contenido específico

#### **3. Gestionar Lecciones del Módulo**

En la lista de lecciones verás:

```
📊 Información de cada lección:
- Número de orden
- Título
- Descripción
- Categoría y nivel
- Duración estimada
- Badges:
  - 📌 Exclusiva (si es exclusiva del módulo)
  - Obligatoria (si es obligatoria)
```

**Acciones disponibles:**

```
1. Click en la lección → Ver/editar contenido
2. Click en "⋯" (menú) → Opciones:
   - 🗑️ Desvincular lección
```

**⚠️ Importante:**
- Si desvinculas una lección **pública**, solo se quita del módulo (la lección sigue existiendo)
- Si intentas desvincular una lección **exclusiva**, el sistema te avisará que debes eliminarla completamente

---

### **Para Estudiantes:**

#### **1. Ver Lecciones del Módulo**

```
1. Inscríbete en un curso
2. Entra al curso
3. Selecciona un módulo
4. Verás la lista de lecciones con:
   - ✅ Completada (si ya la terminaste)
   - 📌 Exclusiva (si es exclusiva del módulo)
   - Obligatoria (si es obligatoria)
   - Duración estimada
```

#### **2. Acceder a una Lección**

```
1. Click en la lección que quieras estudiar
2. Se abre la página de la lección
3. Estudia el contenido
4. Tu progreso se guarda automáticamente
5. Click en "← Salir" para volver al módulo
```

**🎯 Navegación Inteligente:**
- Si entraste desde el módulo → Vuelves al módulo
- Si entraste desde `/lecciones` → Vuelves al catálogo

#### **3. Progreso Compartido**

```
Escenario: Completaste una lección desde el catálogo público

1. Completas "Números del 1 al 10" desde /lecciones
2. Luego te inscribes en un curso que tiene esa lección
3. Cuando veas el módulo, la lección aparecerá con:
   ✅ Ya completada
4. Puedes revisarla de nuevo si quieres
5. Tu progreso se mantiene
```

---

## 🎨 **Tipos de Lecciones**

### **1. Lección Pública** 🌐

```
Características:
✅ Aparece en /lecciones (catálogo público)
✅ Puede vincularse a múltiples módulos
✅ Puede completarse independientemente
✅ No se elimina con el módulo
✅ Visible para todos los usuarios

Cuándo usar:
- Contenido reutilizable
- Lecciones generales de náhuatl
- Temas que pueden aplicar a varios cursos
```

### **2. Lección Exclusiva** 📌

```
Características:
❌ NO aparece en /lecciones
❌ NO puede vincularse a otros módulos
✅ Solo visible en su módulo
✅ Se elimina si se elimina el módulo
✅ Solo visible para estudiantes inscritos

Cuándo usar:
- Introducción específica al módulo
- Contenido único del curso
- Material que no aplica a otros contextos
- Ejercicios específicos del módulo
```

---

## 📊 **Ejemplos de Uso**

### **Ejemplo 1: Curso de Náhuatl Básico**

```
Módulo 1: Saludos
├── 📌 Introducción al módulo (Exclusiva)
├── 🌐 Saludos formales (Pública)
├── 🌐 Saludos informales (Pública)
└── 📌 Práctica de saludos (Exclusiva)

Módulo 2: Números
├── 📌 Introducción a los números (Exclusiva)
├── 🌐 Números del 1 al 10 (Pública)
├── 🌐 Números del 11 al 20 (Pública)
└── 📌 Ejercicios de números (Exclusiva)
```

**Ventajas:**
- Las lecciones públicas pueden reutilizarse en otros cursos
- Las introducciones son únicas para cada módulo
- Los ejercicios son específicos del contexto

### **Ejemplo 2: Reutilización de Contenido**

```
Curso A: Náhuatl Básico
  Módulo 1: Colores
    └── 🌐 Colores básicos (Pública)

Curso B: Náhuatl Intermedio
  Módulo 3: Descripción
    └── 🌐 Colores básicos (Pública) ← La misma lección

Resultado:
✅ Un estudiante que completó "Colores básicos" en Curso A
   verá la lección como "Ya completada" en Curso B
✅ No tiene que repetir el contenido
✅ El progreso se comparte entre módulos
```

---

## 🔧 **Solución de Problemas**

### **Problema: No puedo desvincular una lección**

```
Causa: La lección es exclusiva del módulo

Solución:
1. Las lecciones exclusivas no pueden desvincularse
2. Solo pueden eliminarse completamente
3. Si la eliminas, se borra permanentemente
```

### **Problema: La lección no aparece en el catálogo**

```
Causa: Es una lección exclusiva

Solución:
1. Las lecciones exclusivas no aparecen en /lecciones
2. Solo son visibles en su módulo
3. Si quieres que aparezca en el catálogo, crea una lección pública
```

### **Problema: El progreso no se guarda**

```
Causa: Usuario no autenticado o error de conexión

Solución:
1. Verifica que estés logueado
2. Revisa tu conexión a internet
3. Recarga la página
4. Si persiste, contacta soporte
```

---

## 📱 **Atajos de Teclado (Futuro)**

```
En la lista de módulos:
- N → Nuevo módulo
- L → Agregar lección al módulo seleccionado

En el modal de agregar lección:
- Tab → Cambiar entre tabs
- Esc → Cerrar modal
- Enter → Vincular/Crear (según el tab activo)
```

---

## 🎯 **Mejores Prácticas**

### **Para Profesores:**

1. **Organiza bien tus módulos**
   - Usa lecciones exclusivas para introducciones
   - Usa lecciones públicas para contenido reutilizable

2. **Nombra claramente las lecciones**
   - Títulos descriptivos
   - Descripciones concisas

3. **Marca lecciones obligatorias**
   - Ayuda a los estudiantes a priorizar

4. **Reutiliza contenido**
   - No reinventes la rueda
   - Vincula lecciones existentes cuando sea posible

### **Para Estudiantes:**

1. **Sigue el orden sugerido**
   - Las lecciones están ordenadas por dificultad

2. **Completa las obligatorias primero**
   - Son esenciales para el módulo

3. **Revisa lecciones completadas**
   - Puedes volver a verlas cuando quieras

4. **Usa el catálogo público**
   - Explora lecciones adicionales en `/lecciones`

---

## 🎉 **¡Listo para Usar!**

El sistema está 100% funcional y listo para producción.

**Rutas principales:**
- `/profesor/cursos/[id]/modulos` - Lista de módulos
- `/profesor/cursos/[id]/modulos/[moduloId]` - Gestión de lecciones
- `/lecciones` - Catálogo público
- `/lecciones/[id]` - Ver lección individual

**¡Disfruta del nuevo sistema de lecciones!** 🚀📚
