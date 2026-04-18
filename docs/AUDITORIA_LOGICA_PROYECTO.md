# 🔴 AUDITORÍA COMPLETA - LÓGICA DEL PROYECTO
**Fecha:** 17 de abril de 2026  
**Estado:** ⚠️ PROBLEMAS CRÍTICOS ENCONTRADOS

---

## 📋 RESUMEN EJECUTIVO

Se encontraron **12 problemas críticos** que causan:
- ❌ **Duplicación de rutas** (sistemas legados sin deshabilitar)
- ❌ **Conflictos de endpoints** (rutas que se pisan)
- ❌ **Lógica incohesiva** (tablas sin relaciones claras)
- ❌ **Sistema de puntos confuso** (dual, sin claridad)
- ❌ **Falta de endpoints críticos** (inscripción a cursos, progreso)

---

## 🔴 PROBLEMA 1: DUPLICACIÓN DE SISTEMAS DE LECCIONES

### ❌ ACTUALMENTE
```
/backend/src/routes/lecciones.js          ← VIEJO - JSON estático (OBSOLETO)
/backend/src/routes/leccionesRoutes.js    ← NUEVO - BD (CORRECTO)
```

En `index.js`:
```javascript
// app.use('/api/lecciones', leccionesRoutes); ❌ DESHABILITADO - Sistema viejo JSON
app.use('/api/lecciones', leccionesNuevasRoutes); ✅ NUEVO SISTEMA BD
```

### 🟢 SOLUCIÓN
**ELIMINAR COMPLETAMENTE:**
- `/backend/src/routes/lecciones.js` (NO EXISTE lecciones.json en producción)
- Limpiar comentarios de `index.js`

**MANTENER SOLO:**
- `/backend/src/routes/leccionesRoutes.js` (sistema BD funcional)

---

## 🔴 PROBLEMA 2: RUTAS CONFLICTIVAS EN LECCIONES

### ❌ ACTUALMENTE
```javascript
GET /api/lecciones/profesor/mi-lecciones      ← v1
GET /api/lecciones/mis-lecciones             ← v2 (DUPLICADA)
GET /api/lecciones/:id                       ← Conflicto: ¿es "mi-lecciones" un ID?
GET /api/lecciones/estadisticas/generales    ← ¿O es "estadisticas" un ID?
```

Frontend llama a: `GET /api/lecciones/profesor/mis-lecciones`
Pero también existe: `GET /api/lecciones/mis-lecciones`

### 🟢 SOLUCIÓN
**ÚNICO ENDPOINT CORRECTO:**
```javascript
// Ordenar rutas específicas ANTES que :id
GET /api/lecciones/profesor/estadisticas           ✅
GET /api/lecciones/profesor/mis-lecciones          ✅
GET /api/lecciones/estadisticas/generales          ✅
POST /api/lecciones/:id/recursos                   ✅
POST /api/lecciones/:id/quiz                       ✅
PUT /api/lecciones/:id/publicar                    ✅
PUT /api/lecciones/:id/archivar                    ✅
DELETE /api/lecciones/:id                          ✅
GET /api/lecciones/:id                             ✅ (ÚLTIMO)
```

**ELIMINAR:**
```javascript
GET /api/lecciones/mis-lecciones  ← DUPLICADA
```

---

## 🔴 PROBLEMA 3: RELACIONES DE BD INCOMPLETAS

### ❌ ACTUALMENTE
```
cursos
├── profesor_id ✅
├── estado
└── (sin vincular a módulos claramente)

módulos
├── curso_id ✅
└── (sin ordenamiento claro)

lecciones
├── profesor_id ✅
├── modulo_id (FK existe) ⚠️ PERO NO HAY ENDPOINT PARA VINCULAR
└── (orden_tema y orden_leccion duplicados - CONFUSO)

progreso_lecciones
├── leccion_id ✅
├── usuario_id ✅
├── inscripcion_curso_id (existe pero NO SE USA)
└── (falta relación directa con módulos)
```

### PROBLEMA ESPECÍFICO
**La tabla `lecciones` tiene `modulo_id`** pero:
- ❌ No hay endpoint para vincular lecciones a módulos desde lecciones
- ✅ Sí existe en modulosRoutes.js (está disperso)
- ❌ Frontend busca en `/api/modulos/:moduloId/lecciones/vincular`
- ✅ Existe, pero confunde el flujo

### 🟢 SOLUCIÓN
```
Flujo correcto:
1. Profesor crea Curso          → POST /api/cursos
2. Profesor crea Módulos        → POST /api/cursos/:cursoId/modulos
3. Profesor crea Lecciones      → POST /api/lecciones (independientes)
4. Profesor vincula Lecciones   → POST /api/modulos/:moduloId/lecciones/vincular
5. Estudiante se inscribe       → POST /api/cursos/:cursoId/inscribir
6. Estudiante accede leccion    → GET /api/lecciones/:id
7. Sistema registra progreso    → POST /api/progreso/actualizar/:leccionId
```

**CAMBIOS A HACER:**
- ✅ Mantener estructura (está bien)
- ✅ Documentar claramente en comentarios
- ❌ PERO: Falta validar que lección existe en módulo antes de acceder

---

## 🔴 PROBLEMA 4: FALTA DE ENDPOINT CRÍTICO - INSCRIPCIÓN A CURSOS

### ❌ ACTUALMENTE
```javascript
// Existe en cursosRoutes.js
POST /api/cursos/:id/inscribir
GET /api/cursos/:id/verificar-inscripcion
```

**PERO:** No devuelven datos completos sobre:
- ¿Qué módulos debo hacer?
- ¿Cuál es mi progreso?
- ¿Cuánto he avanzado?

### 🟢 SOLUCIÓN
Agregar a `cursosRoutes.js`:
```javascript
/**
 * GET /api/cursos/:id/mi-progreso
 * Obtener progreso del estudiante en el curso
 */
router.get('/:id/mi-progreso', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const usuario_id = req.user.id;

    // Verificar inscripción
    const { data: inscripcion } = await supabase
      .from('inscripciones_cursos')
      .select('*')
      .eq('usuario_id', usuario_id)
      .eq('curso_id', id)
      .single();

    if (!inscripcion) {
      return res.status(403).json({ error: 'No estás inscrito en este curso' });
    }

    // Obtener módulos y progreso
    const { data: modulos } = await supabase
      .from('modulos')
      .select(`
        *,
        lecciones:lecciones(
          id, titulo, estado_leccion,
          progreso_lecciones!left(
            estado_leccion,
            puntuacion_quiz
          )
        )
      `)
      .eq('curso_id', id);

    // Calcular progreso total
    const totalLecciones = modulos.reduce(
      (sum, m) => sum + (m.lecciones?.length || 0), 0
    );
    const leccionesCompletadas = modulos.reduce(
      (sum, m) => sum + (m.lecciones?.filter(l => l.estado_leccion === 'completada').length || 0), 0
    );

    res.json({
      inscripcion,
      modulos,
      progreso: {
        total_lecciones: totalLecciones,
        completadas: leccionesCompletadas,
        porcentaje: (leccionesCompletadas / totalLecciones * 100) || 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error interno' });
  }
});
```

---

## 🔴 PROBLEMA 5: SISTEMA DE PUNTOS CONFUSO Y DUAL

### ❌ ACTUALMENTE
```sql
recompensas_usuario {
  puntos_totales              -- ¿Es esto la suma de todo?
  puntos_conocimiento         -- ¿Lecciones completadas?
  experiencia_social          -- ¿Likes y temas?
  
  experiencia                 -- ¿Qué es esto? ¿es igual a puntos_totales?
  
  nivel (principiante, contribuidor, experto, maestro, leyenda)
}

historial_puntos {
  puntos_ganados
  motivo (enum)               -- Solo "leccion_completada"?
}
```

### PROBLEMAS ESPECÍFICOS
1. **¿Cuál es la fuente de verdad?** `puntos_totales` vs `experiencia`
2. **No hay cálculo claro** de cómo se ganan puntos
3. **Tabla `historial_puntos` débil** - solo tiene motivo y puntos, sin detalles
4. **Sistema social y conocimiento separados** pero sin claridad en frontend

### 🟢 SOLUCIÓN PROPUESTA

**CAMBIAR `historial_puntos` A:**
```sql
CREATE TABLE historial_puntos (
  id uuid PRIMARY KEY,
  usuario_id uuid REFERENCES perfiles(id),
  puntos_ganados integer,
  puntos_conocimiento integer DEFAULT 0,  -- +0 a +10
  puntos_sociales integer DEFAULT 0,       -- +0 a +5
  motivo text CHECK (motivo IN (
    'leccion_completada',      -- +10 pts conocimiento
    'quiz_aprobado',           -- +5 pts conocimiento
    'contribucion_aprobada',   -- +10 pts conocimiento
    'like_recibido',           -- +1 pto social
    'tema_publicado',          -- +5 pts social
    'primer_tema',             -- +10 pts social
    'racha_semanal'            -- +20 pts mixtos
  )),
  descripcion text,
  fecha_creacion timestamp DEFAULT now()
);

-- Vista para cálculo automático:
CREATE VIEW usuario_puntos AS
SELECT 
  usuario_id,
  COALESCE(SUM(puntos_conocimiento), 0) as total_conocimiento,
  COALESCE(SUM(puntos_sociales), 0) as total_social,
  COALESCE(SUM(puntos_conocimiento), 0) + COALESCE(SUM(puntos_sociales), 0) as puntos_totales
FROM historial_puntos
GROUP BY usuario_id;
```

**EN CÓDIGO:**
```javascript
// Cuando se completa una lección:
await supabase.from('historial_puntos').insert({
  usuario_id,
  puntos_conocimiento: 10,
  puntos_sociales: 0,
  motivo: 'leccion_completada',
  descripcion: `Completaste lección "${leccionTitulo}" con ${porcentaje}% de aciertos`
});

// Cuando se da un like:
await supabase.from('historial_puntos').insert({
  usuario_id: creadorId,
  puntos_conocimiento: 0,
  puntos_sociales: 1,
  motivo: 'like_recibido',
  descripcion: `${usuarioQueDaLike.nombre} te dio like en tu tema`
});
```

---

## 🔴 PROBLEMA 6: SOLICITUDES DE MAESTROS SIN RELACIÓN CON ROLES

### ❌ ACTUALMENTE
```sql
solicitudes_maestros {
  usuario_id          -- FK a perfiles
  estado              -- 'pendiente', 'aprobada', 'rechazada'
  especialidad_id     -- FK a especialidades_maestros
  fecha_aprobacion
}

perfiles {
  rol                 -- 'usuario', 'moderador', 'admin', 'profesor'
}
```

### PROBLEMA
- ✅ Solicitud aprobada ← Pero ¿quién cambia `perfiles.rol` a 'profesor'?
- ❌ No hay trigger que sincronice `solicitudes_maestros.estado = 'aprobada'` con `perfiles.rol = 'profesor'`
- ❌ Un usuario podría tener solicitud aprobada pero rol = 'usuario'

### 🟢 SOLUCIÓN
**CREAR TRIGGER EN BD:**
```sql
CREATE OR REPLACE FUNCTION actualizar_rol_maestro()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.estado = 'aprobada' AND OLD.estado != 'aprobada' THEN
    UPDATE perfiles 
    SET rol = 'profesor'
    WHERE id = NEW.usuario_id;
  END IF;
  
  IF NEW.estado = 'rechazada' AND OLD.estado != 'rechazada' THEN
    -- No cambiar rol automáticamente si ya es profesor
    -- Solo loguear rechazos
    INSERT INTO logs_solicitudes (usuario_id, solicitud_id, tipo_cambio)
    VALUES (NEW.usuario_id, NEW.id, 'rechazada');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_rol_maestro
AFTER UPDATE ON solicitudes_maestros
FOR EACH ROW
EXECUTE FUNCTION actualizar_rol_maestro();
```

**EN CÓDIGO BACKEND:**
```javascript
// routes/solicitudesMaestrosRoutes.js
router.put('/:id/aprobar', authenticateToken, async (req, res) => {
  try {
    // 1. Actualizar solicitud
    const { data: solicitud } = await supabase
      .from('solicitudes_maestros')
      .update({ 
        estado: 'aprobada',
        fecha_aprobacion: new Date().toISOString(),
        admin_revisor_id: req.user.id
      })
      .eq('id', req.params.id)
      .select()
      .single();

    // 2. El trigger se dispara automáticamente
    // 3. Notificar al usuario
    await supabase.from('notificaciones').insert({
      usuario_id: solicitud.usuario_id,
      tipo_notificacion: 'solicitud_maestro_aprobada',
      titulo: '¡Felicidades!',
      mensaje: 'Tu solicitud para ser maestro ha sido aprobada'
    });

    res.json({ success: true, solicitud });
  } catch (error) {
    res.status(500).json({ error: 'Error al aprobar solicitud' });
  }
});
```

---

## 🔴 PROBLEMA 7: CONTROLADOR LECCIONESCONTROLLER ESPERA MODULO_ID

### ❌ ACTUALMENTE EN leccionesController.js
```javascript
const crearLeccion = async (req, res) => {
  const {
    titulo,
    categoria,
    nivel = 'principiante',
    contenido_texto,
    // ... otros campos ...
    // ❌ NO VALIDA QUE modulo_id EXISTE
  } = req.body;
  // ...
};
```

### PROBLEMA
- Frontend PODRÍA enviar una lección sin módulo (lección independiente) ✅
- O podría enviar con módulo_id (lección de módulo) ✅
- **PERO:** No hay validación de que el módulo existe y pertenece al profesor

### 🟢 SOLUCIÓN
```javascript
const crearLeccion = async (req, res) => {
  const {
    titulo,
    categoria,
    nivel = 'principiante',
    contenido_texto,
    modulo_id = null,  // Opcional
    // ...
  } = req.body;

  const profesor_id = req.user.id;

  // ✅ Validar módulo si se proporciona
  if (modulo_id) {
    const { data: modulo, error } = await supabase
      .from('modulos')
      .select('curso_id')
      .eq('id', modulo_id)
      .single();

    if (error || !modulo) {
      return res.status(404).json({ error: 'Módulo no encontrado' });
    }

    // Verificar que el profesor es dueño del curso
    const { data: curso } = await supabase
      .from('cursos')
      .select('profesor_id')
      .eq('id', modulo.curso_id)
      .single();

    if (curso.profesor_id !== profesor_id && req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'No tienes permisos para este módulo' });
    }
  }

  // Crear lección...
};
```

---

## 🔴 PROBLEMA 8: INSCRIPCION_CURSO_ID EN PROGRESO_LECCIONES NO SE USA

### ❌ ACTUALMENTE
```sql
progreso_lecciones {
  id uuid,
  usuario_id uuid,
  leccion_id uuid,
  inscripcion_curso_id uuid,  ← ¿CUÁNDO SE RELLENA?
  estado_leccion,
  puntuacion_quiz,
  ...
}
```

### PROBLEMA
- Campo existe pero NUNCA SE RELLENA en controladores
- ¿Cuál es el punto de tenerlo?
- Causa confusión sobre cómo rastrear progreso por curso

### 🟢 SOLUCIÓN - OPCIÓN A (Recomendada)
**ELIMINAR** `inscripcion_curso_id` de `progreso_lecciones`

Razón: Cada lección ya sabe a qué módulo pertenece → al módulo pertenece un curso. Eso es suficiente.

**NUEVA CONSULTA:**
```javascript
// Obtener progreso del estudiante en un curso
GET /api/cursos/:cursoId/mi-progreso

const { data: modulos } = await supabase
  .from('modulos')
  .select(`
    *,
    lecciones!inner(
      id, titulo, modulo_id,
      progreso_lecciones(
        usuario_id, estado_leccion, puntuacion_quiz
      )
    )
  `)
  .eq('curso_id', cursoId)
  .eq('lecciones.progreso_lecciones.usuario_id', userId);
```

### O SOLUCIÓN B (Si quieres mantener para auditoría)
**MANTENER** y RELLENAR cada vez que se registra progreso:
```javascript
const { data: leccion } = await supabase
  .from('lecciones')
  .select('modulo_id')
  .eq('id', leccionId)
  .single();

const { data: modulo } = await supabase
  .from('modulos')
  .select('curso_id')
  .eq('id', leccion.modulo_id)
  .single();

const { data: inscripcion } = await supabase
  .from('inscripciones_cursos')
  .select('id')
  .eq('usuario_id', userId)
  .eq('curso_id', modulo.curso_id)
  .single();

// Ahora sí rellenar:
await supabase.from('progreso_lecciones').update({
  inscripcion_curso_id: inscripcion.id,
  // ...
}).eq('id', progresoId);
```

---

## 🔴 PROBLEMA 9: RUTAS DE MÓDULOS CONFUSAS

### ❌ ACTUALMENTE
```javascript
// En cursosRoutes.js:
GET /api/cursos/:cursoId/modulos

// En modulosRoutes.js:
GET /api/modulos/:id
POST /api/modulos/:id/temas
DELETE /api/modulos/:id/temas/:leccionId

// CONFLICTO: ¿:id es el moduloId o cursoId?
```

### 🟢 SOLUCIÓN
**USAR PREFIJOS CLAROS:**
```javascript
// En cursosRoutes.js:
GET /api/cursos/:cursoId/modulos
POST /api/cursos/:cursoId/modulos

// En modulosRoutes.js (INDEPENDIENTE):
GET /api/modulos/:moduloId
PUT /api/modulos/:moduloId
DELETE /api/modulos/:moduloId

// Lecciones EN módulo:
GET /api/modulos/:moduloId/lecciones
POST /api/modulos/:moduloId/lecciones/vincular
DELETE /api/modulos/:moduloId/lecciones/:leccionId
```

---

## 🔴 PROBLEMA 10: FALTA ENDPOINT DE ESTADÍSTICAS INTELIGENTES

### ❌ ACTUALMENTE
```javascript
GET /api/lecciones/profesor/estadisticas
GET /api/lecciones/estadisticas/generales
```

**PERO:** No existe para:
- Progreso de estudiante en un módulo
- Comparación de calificaciones
- Pronóstico de finalización

### 🟢 SOLUCIÓN
Agregar a `progresoRoutes.js`:
```javascript
/**
 * GET /api/progreso/curso/:cursoId/estadisticas
 * Estadísticas del estudiante en un curso
 */
router.get('/curso/:cursoId/estadisticas', authenticateToken, async (req, res) => {
  const { cursoId } = req.params;
  const userId = req.user.id;

  const { data: modulos } = await supabase
    .from('modulos')
    .select(`
      id, titulo,
      lecciones(
        id, titulo, duracion_estimada,
        progreso_lecciones(
          estado_leccion, puntuacion_quiz, tiempo_total_minutos
        )
      )
    `)
    .eq('curso_id', cursoId);

  const estadisticas = {
    modulos_total: modulos.length,
    lecciones_total: modulos.reduce((sum, m) => sum + (m.lecciones?.length || 0), 0),
    lecciones_completadas: 0,
    promedio_calificacion: 0,
    tiempo_total_horas: 0,
    modulos_completados: 0
  };

  // Calcular...
  res.json(estadisticas);
});
```

---

## 🔴 PROBLEMA 11: FRONTEND USA ENDPOINTS INCONSISTENTES

### ❌ ACTUALMENTE
```javascript
// BuscadorLecciones.tsx
fetch(`${API_URL}/api/modulos/${moduloId}/lecciones/vincular`, {method: 'POST'})

// Quiz.tsx
fetch(`/api/lecciones/${leccionId}/quiz`)  ← RUTA RELATIVA

// profesor/page.tsx
fetch(`${API_URL}/api/lecciones/profesor/estadisticas`)
fetch(`${API_URL}/api/lecciones/profesor/mis-lecciones`)
```

### PROBLEMAS
- ❌ Inconsistencia: veces usa `API_URL`, veces ruta relativa
- ❌ Frontend NO SABE qué ruta es correcta si falla

### 🟢 SOLUCIÓN
Crear servicio centralizado en frontend:
```typescript
// frontend/src/services/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const API = {
  lecciones: {
    lista: (filtros?: any) => 
      `${API_URL}/api/lecciones?${new URLSearchParams(filtros)}`,
    obtener: (id: string) => 
      `${API_URL}/api/lecciones/${id}`,
    crear: () => 
      `${API_URL}/api/lecciones`,
    profesor: {
      mis: () => 
        `${API_URL}/api/lecciones/profesor/mis-lecciones`,
      stats: () => 
        `${API_URL}/api/lecciones/profesor/estadisticas`
    }
  },
  cursos: {
    lista: () => 
      `${API_URL}/api/cursos`,
    obtener: (id: string) => 
      `${API_URL}/api/cursos/${id}`,
    inscribir: (id: string) => 
      `${API_URL}/api/cursos/${id}/inscribir`,
    miProgreso: (id: string) => 
      `${API_URL}/api/cursos/${id}/mi-progreso`
  },
  // ...
};

// Uso en componentes:
const res = await fetch(API.lecciones.profesor.mis());
```

---

## 🔴 PROBLEMA 12: MIDDLEWARE DE AUTENTICACIÓN INCONSISTENTE

### ❌ ACTUALMENTE
```javascript
// Algunos routes usan:
router.get('/', obtenerLecciones);  ← SIN middleware

// Otros:
router.get('/', authenticateToken, obtenerLecciones);  ← CON middleware

// Otros usan middleware OPCIONAL:
const optionalAuthenticate = (req, res, next) => {
  // intenta JWT
  // si falla, continúa sin usuario
};
```

### PROBLEMA
- Inconsistencia sobre quién puede acceder qué
- Frontend no sabe si deberá enviar token o no

### 🟢 SOLUCIÓN
Documentar claramente:
```javascript
// 📖 PATRÓN DE AUTENTICACIÓN

// ✅ PÚBLICO - sin token (lecciones publicadas, cursos públicos)
router.get('/lecciones', obtenerLecciones);  // Todos ven lecciones publicadas

// ✅ AUTENTICADO REQUERIDO (acciones de usuario)
router.post('/lecciones/:id/progreso', authenticateToken, registrarProgreso);

// ✅ AUTENTICADO OPCIONAL (más detalles si está autenticado)
router.get('/lecciones/:id', optionalAuth, obtenerLeccionDetalle);
// Si está autenticado: devuelve progreso del usuario
// Si no está: solo datos públicos

// ✅ PROFESOR REQUERIDO
router.post('/lecciones', authenticateToken, verificarProfesor, crearLeccion);

// ✅ ADMIN REQUERIDO
router.delete('/usuarios/:id', authenticateToken, verificarAdmin, eliminarUsuario);
```

---

## 📋 CHECKLIST DE CORRECCIONES

### CRÍTICAS (Hacer YA):
- [ ] Eliminar `/backend/src/routes/lecciones.js`
- [ ] Limpiar comentarios de `index.js` referentes a lecciones.json
- [ ] Reordenar rutas en `leccionesRoutes.js` (específicas antes de `:id`)
- [ ] Agregar validación de `modulo_id` en `crearLeccion`
- [ ] Crear endpoint `GET /api/cursos/:id/mi-progreso`
- [ ] Crear trigger en BD para sincronizar `solicitudes_maestros.estado` con `perfiles.rol`

### IMPORTANTES (Hacer en Sprint):
- [ ] Refactorizar sistema de puntos con tabla mejorada `historial_puntos`
- [ ] Eliminar o rellenar `inscripcion_curso_id` en `progreso_lecciones`
- [ ] Crear servicio centralizado de API en frontend
- [ ] Documentar matriz de autenticación por ruta
- [ ] Agregar endpoint de estadísticas inteligentes

### MEJORAS (Backlog):
- [ ] Crear vista SQL para cálculo automático de puntos
- [ ] Implementar logs de auditoría en `solicitudes_maestros`
- [ ] Tests E2E para flujos de inscripción→progreso

---

## 🎯 PRIORIDAD DE IMPLEMENTACIÓN

**SEMANA 1 (Crítico):**
```
1. Eliminar sistema viejo JSON
2. Reordenar rutas (específicas primero)
3. Validar módulos en crear lección
4. Crear endpoint de progreso en curso
```

**SEMANA 2 (Importante):**
```
5. Refactorizar puntos
6. Trigger de sincronización de roles
7. Servicio API en frontend
```

**SEMANA 3 (Mejoras):**
```
8. Tests
9. Documentación completa
10. Logs de auditoría
```

---

**PRÓXIMO PASO:** ¿Cuál problema quieres que resuelva primero? Puedo hacer los cambios automáticamente.
