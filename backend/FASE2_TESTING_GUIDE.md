# 🚀 FASE 2 COMPLETADA: Sistema de Lecciones - API Testing

## ✅ **ENTREGABLES IMPLEMENTADOS**

### **1. Endpoints de Solicitudes de Maestros**
- ✅ `POST /api/solicitudes-maestros` - Crear solicitud
- ✅ `GET /api/solicitudes-maestros/mis-solicitudes` - Ver mis solicitudes  
- ✅ `GET /api/solicitudes-maestros/admin` - Ver todas (admin)
- ✅ `PUT /api/solicitudes-maestros/:id/procesar` - Aprobar/rechazar
- ✅ `GET /api/solicitudes-maestros/estadisticas` - Stats admin

### **2. Endpoints de Lecciones**
- ✅ `GET /api/lecciones-nueva` - Listar lecciones públicas
- ✅ `GET /api/lecciones-nueva/:id` - Ver lección específica
- ✅ `POST /api/lecciones-nueva` - Crear lección (profesores)
- ✅ `GET /api/lecciones-nueva/mis-lecciones` - Mis lecciones
- ✅ `PUT /api/lecciones-nueva/:id` - Actualizar lección
- ✅ `PUT /api/lecciones-nueva/:id/publicar` - Publicar lección
- ✅ `PUT /api/lecciones-nueva/:id/archivar` - Archivar lección
- ✅ `POST /api/lecciones-nueva/:id/recursos` - Agregar recursos
- ✅ `POST /api/lecciones-nueva/:id/quiz` - Agregar preguntas
- ✅ `GET /api/lecciones-nueva/estadisticas/generales` - Stats generales

### **3. Middlewares de Validación**
- ✅ `verificarProfesor` - Verificar rol profesor
- ✅ `verificarAdmin` - Verificar rol admin/moderador
- ✅ `verificarPuedeSolicitarMaestro` - Validar elegibilidad
- ✅ `validarSolicitudMaestro` - Validar datos solicitud
- ✅ `validarLeccion` - Validar datos lección
- ✅ `validarRecursosExternos` - Validar URLs externas
- ✅ `validarQuizPreguntas` - Validar preguntas quiz

### **4. Servicios y Utilidades**
- ✅ `validaciones.js` - Funciones de validación completas
- ✅ Integración con `notificationService` existente
- ✅ Manejo de errores robusto
- ✅ Logging y debugging

---

## 🧪 **GUÍA DE TESTING - Usar en Postman/Thunder Client**

### **PASO 1: Crear Solicitud de Maestro**

```bash
# 1. Login primero para obtener token
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "email": "tu_email@ejemplo.com",
  "password": "tu_password"
}

# 2. Crear solicitud de maestro
POST http://localhost:3001/api/solicitudes-maestros
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "especialidad": "numeros",
  "experiencia": "Tengo 5 años de experiencia enseñando náhuatl en mi comunidad. He trabajado con niños y adultos, desarrollando métodos didácticos efectivos.",
  "motivacion": "Quiero preservar y compartir la lengua náhuatl con más personas a través de esta plataforma.",
  "propuesta_contenido": "Propongo crear un curso completo sobre números en náhuatl, desde los conceptos básicos hasta operaciones matemáticas complejas. Incluiré pronunciación, escritura y uso cultural de los números.",
  "habilidades_especiales": "Hablo náhuatl nativo, tengo formación pedagógica",
  "disponibilidad_horas": "20 horas por semana"
}
```

### **PASO 2: Admin Aprueba Solicitud (necesitas ser admin)**

```bash
# 1. Ver solicitudes pendientes
GET http://localhost:3001/api/solicitudes-maestros/admin?estado=pendiente
Authorization: Bearer ADMIN_JWT_TOKEN

# 2. Aprobar solicitud
PUT http://localhost:3001/api/solicitudes-maestros/SOLICITUD_ID/procesar
Authorization: Bearer ADMIN_JWT_TOKEN
Content-Type: application/json

{
  "accion": "aprobar",
  "comentarios_admin": "Excelente propuesta y experiencia. Aprobado para crear contenido de números."
}
```

### **PASO 3: Crear Lección (como profesor aprobado)**

```bash
# 1. Crear lección básica
POST http://localhost:3001/api/lecciones-nueva
Authorization: Bearer PROFESOR_JWT_TOKEN
Content-Type: application/json

{
  "titulo": "Números del 1 al 10 en Náhuatl",
  "descripcion": "Aprende los números básicos en náhuatl con pronunciación y ejemplos",
  "categoria": "numeros",
  "nivel": "principiante",
  "contenido_texto": "En esta lección aprenderemos los números básicos del 1 al 10 en náhuatl:\n\n1 - ce (se)\n2 - ome (o-me)\n3 - yei (ye-i)\n4 - nahui (na-ui)\n5 - macuilli (ma-cuil-li)\n6 - chicuace (chi-cua-ce)\n7 - chicome (chi-co-me)\n8 - chicuei (chi-cue-i)\n9 - chiconahui (chi-co-na-ui)\n10 - matlactli (mat-lac-tli)\n\nEstos números son fundamentales para contar objetos y realizar operaciones básicas.",
  "contenido_nahuatl": "Kenin tikuajtosket tlapuali ipan nawatlajtoli",
  "objetivos_aprendizaje": [
    "Memorizar los números del 1 al 10",
    "Pronunciar correctamente cada número",
    "Usar los números en oraciones simples"
  ],
  "palabras_clave": ["números", "contar", "básico", "pronunciación"],
  "duracion_estimada": 25,
  "orden_leccion": 1,
  "recursos_externos": [
    {
      "tipo_recurso": "video_youtube",
      "titulo": "Pronunciación de números en náhuatl",
      "descripcion": "Video demostrativo de pronunciación",
      "url": "https://youtube.com/watch?v=ejemplo123",
      "orden_visualizacion": 1,
      "es_opcional": false,
      "duracion_segundos": 180
    },
    {
      "tipo_recurso": "imagen_drive",
      "titulo": "Tabla visual de números",
      "descripcion": "Imagen con números escritos en náhuatl",
      "url": "https://drive.google.com/file/d/ejemplo/view",
      "orden_visualizacion": 2,
      "es_opcional": true
    }
  ],
  "quiz_preguntas": [
    {
      "pregunta": "¿Cómo se dice 'cinco' en náhuatl?",
      "tipo_pregunta": "multiple_choice",
      "opciones": {
        "a": "nahui",
        "b": "macuilli", 
        "c": "chicuace",
        "d": "yei"
      },
      "respuesta_correcta": "b",
      "explicacion": "Macuilli es la palabra náhuatl para el número cinco",
      "puntos": 2,
      "orden_pregunta": 1
    },
    {
      "pregunta": "¿Verdadero o falso? 'Ome' significa 'dos' en náhuatl",
      "tipo_pregunta": "verdadero_falso",
      "opciones": {
        "verdadero": "Verdadero",
        "falso": "Falso"
      },
      "respuesta_correcta": "verdadero",
      "explicacion": "Correcto, 'ome' es la palabra náhuatl para el número dos",
      "puntos": 1,
      "orden_pregunta": 2
    }
  ]
}
```

### **PASO 4: Publicar Lección**

```bash
# 1. Ver mis lecciones
GET http://localhost:3001/api/lecciones-nueva/mis-lecciones
Authorization: Bearer PROFESOR_JWT_TOKEN

# 2. Publicar lección
PUT http://localhost:3001/api/lecciones-nueva/LECCION_ID/publicar
Authorization: Bearer PROFESOR_JWT_TOKEN
```

### **PASO 5: Ver Lecciones Públicas**

```bash
# 1. Ver todas las lecciones públicas
GET http://localhost:3001/api/lecciones-nueva

# 2. Ver lecciones por categoría
GET http://localhost:3001/api/lecciones-nueva?categoria=numeros

# 3. Ver lección específica
GET http://localhost:3001/api/lecciones-nueva/LECCION_ID
Authorization: Bearer USER_JWT_TOKEN
```

### **PASO 6: Agregar Recursos y Preguntas Adicionales**

```bash
# 1. Agregar recurso externo
POST http://localhost:3001/api/lecciones-nueva/LECCION_ID/recursos
Authorization: Bearer PROFESOR_JWT_TOKEN
Content-Type: application/json

{
  "tipo_recurso": "audio_externo",
  "titulo": "Audio de práctica números",
  "descripcion": "Ejercicios de pronunciación guiada",
  "url": "https://ejemplo.com/audio/numeros.mp3",
  "es_opcional": false,
  "duracion_segundos": 300
}

# 2. Agregar pregunta de quiz
POST http://localhost:3001/api/lecciones-nueva/LECCION_ID/quiz
Authorization: Bearer PROFESOR_JWT_TOKEN
Content-Type: application/json

{
  "pregunta": "Completa la secuencia: ce, ome, yei, ____",
  "tipo_pregunta": "completar_texto",
  "respuesta_correcta": "nahui",
  "explicacion": "Después de yei (tres) viene nahui (cuatro)",
  "puntos": 2
}
```

---

## 📊 **ENDPOINTS DE ESTADÍSTICAS PARA TESTING**

```bash
# 1. Estadísticas de solicitudes (admin)
GET http://localhost:3001/api/solicitudes-maestros/estadisticas
Authorization: Bearer ADMIN_JWT_TOKEN

# 2. Estadísticas generales de lecciones
GET http://localhost:3001/api/lecciones-nueva/estadisticas/generales
```

---

## 🔍 **VALIDACIONES A PROBAR**

### **Errores Esperados:**
1. **Sin autenticación** → 401 Unauthorized
2. **Sin permisos** → 403 Forbidden  
3. **Campos faltantes** → 400 Bad Request
4. **URLs inválidas** → 400 Bad Request
5. **Categorías no válidas** → 400 Bad Request
6. **Solicitud duplicada** → 400 Bad Request
7. **Lección ya publicada** → 400 Bad Request

### **Casos Exitosos:**
1. **Solicitud maestro** → 201 Created + notificación admin
2. **Aprobación** → 200 OK + rol actualizado + notificación usuario
3. **Crear lección** → 201 Created + recursos + quiz
4. **Publicar lección** → 200 OK + disponible públicamente
5. **Ver lecciones** → 200 OK + filtros funcionando

---

## 🎯 **PRÓXIMOS PASOS (FASE 3)**

Con la Fase 2 completada, ahora tenemos:
- ✅ Base de datos funcional
- ✅ API backend completa
- ✅ Middlewares de validación
- ✅ Sistema de notificaciones integrado

**Siguiente: FASE 3 - Frontend (Panel de Solicitudes)**

¿Listo para continuar con el frontend o quieres probar la API primero?