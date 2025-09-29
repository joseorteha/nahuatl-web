# 📋 ENDPOINTS DEL SISTEMA DE PERFIL ÚNICO

## 🎯 **NUEVOS ENDPOINTS CREADOS**

### **📚 Sistema de Conocimiento**

#### **GET /api/profile/conocimiento/:userId**
- **Descripción**: Obtener datos específicos del sistema de conocimiento
- **Autenticación**: Requerida
- **Permisos**: Solo el propio usuario o admin
- **Respuesta**:
```json
{
  "success": true,
  "data": {
    "puntos_conocimiento": 150,
    "nivel_conocimiento": "estudiante",
    "siguiente_nivel": "conocedor",
    "puntos_para_siguiente": 150,
    "progreso_porcentaje": 50,
    "total_contribuciones": 5,
    "contribuciones_aprobadas": 3,
    "contribuciones_pendientes": 2,
    "contribuciones_rechazadas": 0,
    "palabras_guardadas": 12,
    "logros_conocimiento": [...],
    "historial_conocimiento": [...],
    "contribuciones_recientes": [...]
  }
}
```

---

### **💬 Sistema de Comunidad**

#### **GET /api/profile/comunidad/:userId**
- **Descripción**: Obtener datos específicos del sistema social/comunidad
- **Autenticación**: Requerida
- **Permisos**: Solo el propio usuario o admin
- **Respuesta**:
```json
{
  "success": true,
  "data": {
    "experiencia_social": 75,
    "nivel_comunidad": "participante",
    "siguiente_nivel": "influencer",
    "puntos_para_siguiente": 75,
    "progreso_porcentaje": 50,
    "total_feedbacks": 8,
    "likes_dados": 25,
    "likes_recibidos": 15,
    "respuestas_creadas": 12,
    "contenido_compartido": 5,
    "ranking_semanal": 15,
    "ranking_mensual": 8,
    "ranking_anual": 3,
    "logros_comunidad": [...],
    "historial_comunidad": [...],
    "feedbacks_recientes": [...]
  }
}
```

---

### **📊 Resumen General**

#### **GET /api/profile/resumen/:userId**
- **Descripción**: Obtener resumen general del perfil (ambos sistemas)
- **Autenticación**: Requerida
- **Permisos**: Solo el propio usuario o admin
- **Respuesta**:
```json
{
  "success": true,
  "data": {
    "perfil": {
      "nombre_completo": "Juan Pérez",
      "username": "juanperez",
      "url_avatar": "https://...",
      "biografia": "Estudiante de náhuatl",
      "verificado": false,
      "fecha_creacion": "2024-01-15T10:30:00Z"
    },
    "puntos": {
      "conocimiento": 150,
      "comunidad": 75,
      "total": 225
    },
    "niveles": {
      "conocimiento": "estudiante",
      "comunidad": "participante"
    },
    "estadisticas": {
      "contribuciones_aprobadas": 3,
      "total_contribuciones": 5,
      "total_feedbacks": 8
    }
  }
}
```

---

## 🔧 **SERVICIOS BACKEND**

### **PointsService**
- **Archivo**: `backend/src/services/pointsService.js`
- **Métodos**:
  - `otorgarPuntosConocimiento(userId, puntos, motivo, descripcion)`
  - `otorgarPuntosComunidad(userId, puntos, motivo, descripcion)`
  - `verificarLogrosConocimiento(userId)`
  - `verificarLogrosComunidad(userId)`
  - `obtenerEstadisticasSeparadas(userId)`

### **ProfileController**
- **Archivo**: `backend/src/controllers/profileController.js`
- **Métodos**:
  - `obtenerConocimiento(req, res)`
  - `obtenerComunidad(req, res)`
  - `obtenerResumen(req, res)`

---

## 📈 **NIVELES DEL SISTEMA**

### **📚 Conocimiento**
| Nivel | Puntos Mínimos | Descripción |
|-------|----------------|-------------|
| `principiante` | 0 | Recién comenzando |
| `estudiante` | 100 | Aprendiendo activamente |
| `conocedor` | 300 | Conocimiento sólido |
| `maestro` | 600 | Experto en el tema |
| `experto` | 1000+ | Máximo nivel |

### **💬 Comunidad**
| Nivel | Puntos Mínimos | Descripción |
|-------|----------------|-------------|
| `novato` | 0 | Nuevo en la comunidad |
| `participante` | 50 | Participando activamente |
| `influencer` | 150 | Influenciando a otros |
| `lider` | 300 | Liderando la comunidad |
| `embajador` | 500+ | Representante de la comunidad |

---

## 🎯 **MOTIVOS DE PUNTOS**

### **📚 Conocimiento**
- `contribucion_diccionario` - Nueva contribución (10 puntos)
- `contribucion_aprobada` - Contribución aprobada (5 puntos)
- `palabra_guardada` - Palabra guardada (1 punto)
- `leccion_completada` - Lección completada (futuro)
- `evaluacion_aprobada` - Evaluación aprobada (futuro)

### **💬 Comunidad**
- `tema_creado` - Tema creado (15 puntos)
- `like_dado` - Like dado (2 puntos)
- `like_recibido` - Like recibido (1 punto)
- `share_dado` - Contenido compartido (3 puntos)
- `share_recibido` - Share recibido (2 puntos)
- `respuesta_creada` - Respuesta creada (5 puntos)
- `feedback_enviado` - Feedback enviado (3 puntos)
- `mencion_usuario` - Usuario mencionado (2 puntos)

---

## 🔄 **COMPATIBILIDAD**

### **Método Legacy**
- El `RecompensasService.otorgarPuntos()` sigue funcionando
- Automáticamente redirige a `PointsService` según el motivo
- Mantiene compatibilidad con código existente

### **Migración Gradual**
- Los endpoints existentes siguen funcionando
- Los nuevos endpoints proporcionan datos separados
- Se puede migrar gradualmente el frontend

---

## 🚀 **PRÓXIMOS PASOS**

1. **Frontend**: Actualizar `profile/page.tsx` para usar los nuevos endpoints
2. **Componentes**: Crear `ConocimientoTab.tsx` y `ComunidadTab.tsx`
3. **Testing**: Probar todos los endpoints con datos reales
4. **Migración**: Actualizar otros servicios para usar el nuevo sistema

---

## 📝 **NOTAS TÉCNICAS**

- **Autenticación**: Todos los endpoints requieren JWT válido
- **Permisos**: Solo el propio usuario o admin puede acceder
- **Validación**: Se valida que el usuario existe y tiene permisos
- **Errores**: Respuestas consistentes con `success: false` en caso de error
- **Performance**: Consultas optimizadas con `select` específicos
