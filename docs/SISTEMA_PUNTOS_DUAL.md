# Sistema de Puntos Dual - Nawatlahtol

## 🎯 **PROBLEMA ACTUAL**
El sistema actual mezcla dos tipos de puntos en la misma tabla, causando confusión:
- Puntos de contribuciones (educativo)
- Puntos de interacciones sociales (comunidad)

## 💡 **SOLUCIÓN: Sistema Dual Separado**

### **🏆 Sistema 1: Puntos de Conocimiento (Educativo)**
```
📚 CONOCIMIENTO DEL NÁHUATL
├── Contribuciones al diccionario
├── Lecciones completadas
├── Palabras aprendidas
├── Evaluaciones aprobadas
└── Participación educativa
```

**Niveles Educativos:**
- 🌱 **Principiante** (0-99 puntos)
- 📚 **Estudiante** (100-299 puntos)
- 🎓 **Conocedor** (300-599 puntos)
- 👑 **Maestro** (600-999 puntos)
- ⭐ **Experto** (1000+ puntos)

### **🤝 Sistema 2: Experiencia Social (Comunidad)**
```
💬 PARTICIPACIÓN COMUNITARIA
├── Likes dados y recibidos
├── Comentarios realizados
├── Contenido compartido
├── Seguidores y seguidos
└── Interacciones sociales
```

**Niveles Sociales:**
- 🌟 **Novato** (0-49 puntos)
- 💬 **Participante** (50-149 puntos)
- 🏆 **Influencer** (150-299 puntos)
- 👑 **Líder** (300-499 puntos)
- ⭐ **Embajador** (500+ puntos)

## 🗄️ **ESTRUCTURA DE BASE DE DATOS**

### **Tabla: `puntos_conocimiento`**
```sql
CREATE TABLE puntos_conocimiento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid REFERENCES perfiles(id),
  puntos_totales integer DEFAULT 0,
  nivel text DEFAULT 'principiante',
  contribuciones_aprobadas integer DEFAULT 0,
  lecciones_completadas integer DEFAULT 0,
  palabras_aprendidas integer DEFAULT 0,
  evaluaciones_aprobadas integer DEFAULT 0,
  fecha_creacion timestamp DEFAULT now(),
  fecha_actualizacion timestamp DEFAULT now()
);
```

### **Tabla: `experiencia_social`**
```sql
CREATE TABLE experiencia_social (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid REFERENCES perfiles(id),
  puntos_totales integer DEFAULT 0,
  nivel text DEFAULT 'novato',
  likes_dados integer DEFAULT 0,
  likes_recibidos integer DEFAULT 0,
  comentarios_realizados integer DEFAULT 0,
  contenido_compartido integer DEFAULT 0,
  seguidores integer DEFAULT 0,
  seguidos integer DEFAULT 0,
  fecha_creacion timestamp DEFAULT now(),
  fecha_actualizacion timestamp DEFAULT now()
);
```

## 🎨 **INTERFAZ DE USUARIO**

### **Perfil del Usuario - Dos Secciones Separadas:**

#### **📚 Sección "Mi Conocimiento"**
```
🏆 Nivel: Conocedor (350/600 puntos)
📊 Progreso: ████████░░ 58%

📈 Estadísticas:
├── 📝 Contribuciones: 12
├── 📚 Lecciones: 8/15
├── 🎯 Evaluaciones: 5/10
└── 📖 Palabras: 45 aprendidas

🎖️ Logros Recientes:
├── 🥇 Primera Contribución
├── 🥈 10 Palabras Aprendidas
└── 🥉 Lección Completada
```

#### **💬 Sección "Mi Comunidad"**
```
🌟 Nivel: Influencer (180/300 puntos)
📊 Progreso: ██████░░░░ 60%

📈 Estadísticas:
├── ❤️ Likes dados: 45
├── 💬 Comentarios: 23
├── 📤 Compartidos: 8
└── 👥 Seguidores: 12

🏆 Logros Sociales:
├── 🥇 Primer Like
├── 🥈 10 Comentarios
└── 🥉 Influencer Naciente
```

## 🔄 **MIGRACIÓN DE DATOS**

### **Paso 1: Separar datos existentes**
```sql
-- Migrar puntos de conocimiento
INSERT INTO puntos_conocimiento (usuario_id, puntos_totales, contribuciones_aprobadas)
SELECT usuario_id, puntos_conocimiento, contribuciones_aprobadas
FROM recompensas_usuario;

-- Migrar experiencia social
INSERT INTO experiencia_social (usuario_id, puntos_totales, likes_recibidos)
SELECT usuario_id, experiencia_social, likes_recibidos
FROM recompensas_usuario;
```

### **Paso 2: Actualizar frontend**
- Separar componentes de recompensas
- Crear dos pestañas: "Conocimiento" y "Comunidad"
- Mostrar niveles y progreso por separado

## 🎯 **BENEFICIOS**

### **✅ Claridad Total**
- Usuarios entienden qué puntos ganan por qué actividad
- Separación clara entre educación y comunidad
- Progreso visual independiente

### **✅ Motivación Específica**
- Usuarios pueden enfocarse en lo que les interesa
- Gamificación dirigida por objetivos
- Logros específicos por área

### **✅ Escalabilidad**
- Fácil agregar nuevos tipos de puntos
- Sistema modular y mantenible
- Analytics separados por categoría

## 🚀 **IMPLEMENTACIÓN**

### **Fase 1: Backend**
1. Crear nuevas tablas
2. Migrar datos existentes
3. Actualizar servicios y controladores
4. Crear endpoints separados

### **Fase 2: Frontend**
1. Separar componente Recompensas
2. Crear pestañas "Conocimiento" y "Comunidad"
3. Actualizar dashboard
4. Añadir animaciones y progreso visual

### **Fase 3: Testing**
1. Probar migración de datos
2. Verificar cálculos de niveles
3. Validar interfaz de usuario
4. Optimizar rendimiento

---

**¿Te parece bien esta propuesta? ¿Quieres que implemente alguna parte específica?**
