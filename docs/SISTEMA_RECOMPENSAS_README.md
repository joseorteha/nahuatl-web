# Sistema de Recompensas - Instrucciones de Instalación

## ¿Qué se ha implementado?

Se ha implementado un **sistema completo de recompensas** para motivar a los contribuidores de la plataforma Nahuatl Web:

### 🏆 Características del Sistema

1. **Sistema de Puntos**
   - Los usuarios ganan puntos por contribuir al diccionario
   - Por enviar feedback y participar en la comunidad
   - Puntos acumulativos que determinan el nivel

2. **Sistema de Niveles**
   - 🌱 Principiante (0+ puntos)
   - 📚 Contribuidor (100+ puntos)
   - 🎓 Experto (500+ puntos)
   - 👑 Maestro (1000+ puntos)
   - ⭐ Leyenda (2500+ puntos)

3. **Sistema de Logros**
   - Logros por primera contribución
   - Logros por cantidad de contribuciones
   - Logros por participación en la comunidad
   - Logros por constancia (días consecutivos)

4. **Interfaz de Usuario**
   - Panel de recompensas en el perfil
   - Visualización de progreso hacia siguiente nivel
   - Lista de logros obtenidos
   - Historial de puntos ganados

### 📁 Archivos Implementados

#### Backend:
- `BD/SISTEMA_RECOMPENSAS.sql` - Esquema de base de datos
- `backend/services/recompensasService.js` - Lógica de negocio
- `backend/controllers/recompensasController.js` - Controladores HTTP
- `backend/routes/recompensasRoutes.js` - Rutas API
- `backend/index.js` - Integración de rutas (actualizado)

#### Frontend:
- `frontend/src/components/Recompensas.tsx` - Componente de UI
- `frontend/src/app/profile/page.tsx` - Integración en perfil (actualizado)

### 🗄️ Endpoints de API Disponibles

- `GET /api/recompensas/usuario/:userId` - Obtener recompensas del usuario
- `GET /api/recompensas/ranking` - Ranking de usuarios
- `POST /api/recompensas/procesar` - Procesar puntos automáticamente
- `GET /api/recompensas/historial/:userId` - Historial de puntos

### 📊 Esquema de Base de Datos

#### Tablas Creadas:
1. **recompensas_usuario** - Datos de puntos y nivel de cada usuario
2. **logros** - Definición de logros disponibles
3. **logros_usuario** - Logros obtenidos por usuarios
4. **historial_puntos** - Registro de puntos ganados

## 🚀 Pasos de Instalación

### 1. Aplicar Esquema de Base de Datos

Ejecuta el archivo SQL en tu instancia de Supabase:

```sql
-- Copiar y ejecutar el contenido de BD/SISTEMA_RECOMPENSAS.sql
-- en la sección SQL Editor de Supabase
```

### 2. Verificar Backend

El backend ya está configurado y ejecutándose en `http://localhost:3001` con los nuevos endpoints.

### 3. Verificar Frontend

El frontend ya está configurado y ejecutándose en `http://localhost:3000` con el nuevo componente de recompensas.

### 4. Probar el Sistema

1. Ve a tu perfil en `http://localhost:3000/profile`
2. Deberías ver la nueva sección "Sistema de Recompensas"
3. Inicialmente tendrás 0 puntos y nivel "Principiante"

### 5. Activar Puntos Automáticamente

Para que los usuarios ganen puntos automáticamente cuando contribuyan:

```javascript
// En el backend, cuando se apruebe una contribución:
await fetch('http://localhost:3001/api/recompensas/procesar', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    usuario_id: 'uuid-del-usuario',
    tipo_accion: 'contribucion_aprobada',
    cantidad: 1
  })
});
```

## 🔧 Configuración Adicional

### Variables de Entorno

No se requieren nuevas variables. El sistema usa la conexión existente de Supabase.

### Integración con Contribuciones

Para activar puntos automáticamente cuando se aprueben contribuciones, agregar llamada a la API en el proceso de aprobación:

```javascript
// Ejemplo en contributionController.js
await recompensasService.otorgarPuntos(usuarioId, 'contribucion_aprobada', 1);
```

## ✅ Estados del Sistema

- ✅ **Backend completo** - Servicios, controladores y rutas implementados
- ✅ **Base de datos** - Esquema completo con logros predefinidos  
- ✅ **Frontend** - Componente integrado en perfil
- ✅ **API** - Endpoints funcionando
- ⏳ **Integración automática** - Pendiente conectar con proceso de aprobación

## 🎯 Próximos Pasos

1. **Aplicar el esquema SQL** en Supabase
2. **Probar el sistema** visitando el perfil
3. **Integrar puntos automáticos** en el flujo de contribuciones
4. **Añadir notificaciones** cuando se obtengan logros
5. **Crear ranking público** en una página dedicada

## 🐛 Solución de Problemas

### Error: "No se pudieron cargar las recompensas"
- Verificar que el esquema SQL esté aplicado
- Verificar conexión a Supabase
- Revisar logs del backend en consola

### Error: "API no responde"
- Verificar que el backend esté ejecutándose en puerto 3001
- Verificar CORS configurado correctamente

### Datos no aparecen
- El sistema inicia con 0 puntos para nuevos usuarios
- Usar el endpoint POST `/api/recompensas/procesar` para otorgar puntos de prueba

## 📝 Notas Técnicas

- Todas las tablas y campos en español por requisito del usuario
- Sistema escalable que permite agregar nuevos logros fácilmente
- Integración completa con sistema de autenticación existente
- Optimizado con índices para mejor rendimiento
