# 📚 Instrucciones: Crear Curso de Ejemplo

## 🎯 Objetivo
Poblar la base de datos con un curso completo de ejemplo para probar el sistema de lecciones.

---

## 📋 **Paso 1: Obtener tu ID de Profesor**

### **Opción A: Ya tienes un usuario profesor**

1. Abre **Supabase Dashboard** → **SQL Editor**
2. Ejecuta el script: `data/obtener_profesor_id.sql`
3. Copia tu `id` (UUID)

```sql
SELECT id, email, nombre_completo, rol
FROM perfiles
WHERE rol = 'profesor'
ORDER BY fecha_creacion DESC;
```

### **Opción B: Necesitas crear/actualizar tu usuario**

Si tu usuario NO es profesor, actualízalo:

```sql
-- Reemplaza con tu email
UPDATE perfiles
SET rol = 'profesor'
WHERE email = 'tu_email@ejemplo.com';

-- Verifica el cambio
SELECT id, email, rol FROM perfiles WHERE email = 'tu_email@ejemplo.com';
```

---

## 📋 **Paso 2: Editar el Script de Seed**

1. Abre el archivo: `data/seed_curso_ejemplo.sql`
2. Busca la línea 14:
   ```sql
   v_profesor_id uuid := 'TU_PROFESOR_ID'; -- ⚠️ REEMPLAZAR CON TU ID
   ```
3. Reemplaza `'TU_PROFESOR_ID'` con tu UUID real:
   ```sql
   v_profesor_id uuid := '123e4567-e89b-12d3-a456-426614174000'; -- Tu ID real
   ```

---

## 📋 **Paso 3: Ejecutar el Script**

1. Abre **Supabase Dashboard** → **SQL Editor**
2. Copia TODO el contenido de `seed_curso_ejemplo.sql`
3. Pega en el editor
4. Click en **"RUN"** ▶️
5. Espera a que termine (~5 segundos)

---

## ✅ **Verificación**

Si todo salió bien, verás mensajes como:

```
NOTICE:  ✅ Curso creado con ID: abc123...
NOTICE:  ✅ Módulo 1 creado con ID: def456...
NOTICE:  ✅ Módulo 2 creado con ID: ghi789...
NOTICE:  ✅ Módulo 3 creado con ID: jkl012...
NOTICE:  ✅ Lección 1 (Pública) creada con ID: mno345...
NOTICE:  ✅ Lección 2 (Pública) creada con ID: pqr678...
...
NOTICE:  ========================================
NOTICE:  ✅ CURSO CREADO EXITOSAMENTE
NOTICE:  ========================================
NOTICE:  Curso ID: abc123...
NOTICE:  Módulos creados: 3
NOTICE:  Lecciones públicas: 5
NOTICE:  Lecciones exclusivas: 1
NOTICE:  Total lecciones: 6
```

---

## 📊 **Qué se Creó**

### **1 Curso:**
- **Título:** Náhuatl Básico - Primeros Pasos
- **Nivel:** Principiante
- **Estado:** Publicado
- **Destacado:** Sí

### **3 Módulos:**

#### **Módulo 1: Saludos y Presentaciones**
- Introducción al módulo (Exclusiva) 📌
- Saludos formales (Pública) 🌐
- Saludos informales (Pública) 🌐

#### **Módulo 2: Números y Conteo**
- Números del 1 al 10 (Pública) 🌐
- Números del 11 al 20 (Pública) 🌐

#### **Módulo 3: Colores y Naturaleza**
- Colores básicos (Pública) 🌐

### **6 Lecciones:**
- **5 Públicas** → Aparecen en `/lecciones`
- **1 Exclusiva** → Solo en Módulo 1

---

## 🧪 **Probar el Sistema**

### **1. Ver el curso en el frontend:**
```
http://localhost:3000/cursos
```

### **2. Gestionar módulos (como profesor):**
```
http://localhost:3000/profesor/cursos/[CURSO_ID]/modulos
```

### **3. Gestionar lecciones de un módulo:**
```
http://localhost:3000/profesor/cursos/[CURSO_ID]/modulos/[MODULO_ID]
```

### **4. Ver catálogo de lecciones públicas:**
```
http://localhost:3000/lecciones
```

---

## 🔍 **Queries Útiles**

### **Ver todos los cursos:**
```sql
SELECT id, titulo, nivel, estado, es_destacado
FROM cursos
ORDER BY fecha_creacion DESC;
```

### **Ver módulos de un curso:**
```sql
SELECT m.id, m.titulo, m.orden_modulo, m.descripcion
FROM modulos m
WHERE m.curso_id = 'TU_CURSO_ID'
ORDER BY m.orden_modulo;
```

### **Ver lecciones de un módulo:**
```sql
SELECT 
  l.id,
  l.titulo,
  l.es_publica,
  l.es_exclusiva_modulo,
  ml.orden_en_modulo,
  ml.es_obligatoria
FROM lecciones l
JOIN modulos_lecciones ml ON l.id = ml.leccion_id
WHERE ml.modulo_id = 'TU_MODULO_ID'
ORDER BY ml.orden_en_modulo;
```

### **Ver todas las lecciones públicas:**
```sql
SELECT id, titulo, categoria, nivel, duracion_estimada
FROM lecciones
WHERE es_publica = true AND estado = 'publicada'
ORDER BY fecha_publicacion DESC;
```

---

## 🎯 **Funcionalidades a Probar**

### **Como Profesor:**
1. ✅ Ver lista de módulos
2. ✅ Entrar a un módulo
3. ✅ Ver lecciones del módulo
4. ✅ Agregar lección existente (vincular)
5. ✅ Crear lección exclusiva
6. ✅ Desvincular lección
7. ✅ Ver diferencia entre lección pública y exclusiva

### **Como Estudiante:**
1. ✅ Inscribirse en el curso
2. ✅ Ver módulos del curso
3. ✅ Entrar a una lección desde el módulo
4. ✅ Ver que vuelve al módulo al salir
5. ✅ Ver lecciones en el catálogo público
6. ✅ Completar una lección
7. ✅ Ver badge "Ya completada"

---

## 🔧 **Solución de Problemas**

### **Error: "column v_profesor_id does not exist"**
```
Causa: No reemplazaste 'TU_PROFESOR_ID' con tu UUID real

Solución:
1. Obtén tu ID con obtener_profesor_id.sql
2. Edita seed_curso_ejemplo.sql línea 14
3. Reemplaza 'TU_PROFESOR_ID' con tu UUID
4. Ejecuta de nuevo
```

### **Error: "null value in column profesor_id"**
```
Causa: El UUID que pusiste no existe en la tabla perfiles

Solución:
1. Verifica que el UUID sea correcto
2. Ejecuta: SELECT id FROM perfiles WHERE id = 'TU_UUID';
3. Si no existe, usa el script obtener_profesor_id.sql
```

### **No veo el curso en el frontend**
```
Causa: El curso está creado pero no aparece

Solución:
1. Verifica que el estado sea 'publicado'
2. Recarga el frontend (Ctrl + Shift + R)
3. Verifica en Supabase que el curso existe
```

---

## 🎉 **¡Listo!**

Ahora tienes un curso completo con:
- ✅ 3 módulos organizados
- ✅ 6 lecciones (5 públicas + 1 exclusiva)
- ✅ Contenido educativo real
- ✅ Estructura lista para probar

**¡Disfruta probando el sistema!** 🚀📚
