# 🎯 PLAN DE IMPLEMENTACIÓN: PERFIL ÚNICO CON DOS SISTEMAS

## 📋 **OBJETIVO**
Crear **un solo perfil principal** con **dos pestañas separadas**:
- 📚 **"Mi Conocimiento"** - Sistema educativo (contribuciones, lecciones)
- 💬 **"Mi Comunidad"** - Sistema social (likes, comentarios, interacciones)

---

## 🏗️ **ARQUITECTURA PROPUESTA**

### **📱 Perfil Principal (`/profile`)**
```
┌─────────────────────────────────────┐
│  👤 Perfil de Usuario              │
│  ┌─────────────────────────────────┐│
│  │ 📊 Resumen General              ││
│  │ • Avatar, nombre, bio           ││
│  │ • Estadísticas básicas          ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 📑 Pestañas                     ││
│  │ ┌─────────────┐ ┌─────────────┐ ││
│  │ │📚 Conocimiento│ │💬 Comunidad │ ││
│  │ │             │ │             │ ││
│  │ │ • Puntos    │ │ • Experiencia│ ││
│  │ │ • Nivel     │ │ • Nivel     │ ││
│  │ │ • Logros    │ │ • Logros    │ ││
│  │ │ • Historial │ │ • Historial │ ││
│  │ └─────────────┘ └─────────────┘ ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

---

## 🔧 **IMPLEMENTACIÓN PASO A PASO**

### **PASO 1: Actualizar Backend APIs**

#### **1.1 Nuevo Endpoint: Datos de Conocimiento**
```javascript
// GET /api/profile/conocimiento/:userId
router.get('/conocimiento/:userId', async (req, res) => {
  const { userId } = req.params;
  
  // Obtener datos específicos del sistema educativo
  const { data: recompensas } = await supabase
    .from('recompensas_usuario')
    .select('puntos_conocimiento, contribuciones_aprobadas, nivel')
    .eq('usuario_id', userId)
    .single();
    
  // Obtener contribuciones
  const { data: contribuciones } = await supabase
    .from('contribuciones_diccionario')
    .select('*')
    .eq('usuario_id', userId);
    
  // Obtener lecciones completadas
  const { data: lecciones } = await supabase
    .from('lecciones_completadas') // Nueva tabla
    .select('*')
    .eq('usuario_id', userId);
    
  res.json({
    puntos_conocimiento: recompensas?.puntos_conocimiento || 0,
    nivel_conocimiento: calcularNivelConocimiento(recompensas?.puntos_conocimiento || 0),
    contribuciones_aprobadas: recompensas?.contribuciones_aprobadas || 0,
    total_contribuciones: contribuciones?.length || 0,
    lecciones_completadas: lecciones?.length || 0,
    logros_conocimiento: await obtenerLogrosConocimiento(userId),
    historial_conocimiento: await obtenerHistorialConocimiento(userId)
  });
});
```

#### **1.2 Nuevo Endpoint: Datos de Comunidad**
```javascript
// GET /api/profile/comunidad/:userId
router.get('/comunidad/:userId', async (req, res) => {
  const { userId } = req.params;
  
  // Obtener datos específicos del sistema social
  const { data: recompensas } = await supabase
    .from('recompensas_usuario')
    .select('experiencia_social, likes_recibidos, ranking_semanal, ranking_mensual')
    .eq('usuario_id', userId)
    .single();
    
  // Obtener interacciones sociales
  const { data: interacciones } = await supabase
    .from('ranking_social')
    .select('*')
    .eq('usuario_id', userId);
    
  res.json({
    experiencia_social: recompensas?.experiencia_social || 0,
    nivel_comunidad: calcularNivelComunidad(recompensas?.experiencia_social || 0),
    likes_recibidos: recompensas?.likes_recibidos || 0,
    likes_dados: interacciones?.likes_dados || 0,
    comentarios_realizados: interacciones?.comentarios_realizados || 0,
    contenido_compartido: interacciones?.contenido_compartido || 0,
    ranking_semanal: recompensas?.ranking_semanal || 0,
    ranking_mensual: recompensas?.ranking_mensual || 0,
    logros_comunidad: await obtenerLogrosComunidad(userId),
    historial_comunidad: await obtenerHistorialComunidad(userId)
  });
});
```

### **PASO 2: Actualizar Frontend**

#### **2.1 Componente Principal del Perfil**
```typescript
// frontend/src/app/profile/page.tsx
export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'conocimiento' | 'comunidad'>('conocimiento');
  const [conocimientoData, setConocimientoData] = useState(null);
  const [comunidadData, setComunidadData] = useState(null);
  
  // Cargar datos específicos por pestaña
  const loadConocimientoData = async () => {
    const response = await fetch(`/api/profile/conocimiento/${userId}`);
    const data = await response.json();
    setConocimientoData(data);
  };
  
  const loadComunidadData = async () => {
    const response = await fetch(`/api/profile/comunidad/${userId}`);
    const data = await response.json();
    setComunidadData(data);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <ConditionalHeader />
      
      {/* Resumen General */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold mb-4">Mi Perfil</h1>
          {/* Avatar, nombre, bio básica */}
        </div>
        
        {/* Pestañas */}
        <div className="bg-white rounded-2xl shadow-lg">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('conocimiento')}
              className={`px-6 py-4 font-medium ${
                activeTab === 'conocimiento' 
                  ? 'text-cyan-600 border-b-2 border-cyan-600' 
                  : 'text-gray-500'
              }`}
            >
              📚 Mi Conocimiento
            </button>
            <button
              onClick={() => setActiveTab('comunidad')}
              className={`px-6 py-4 font-medium ${
                activeTab === 'comunidad' 
                  ? 'text-cyan-600 border-b-2 border-cyan-600' 
                  : 'text-gray-500'
              }`}
            >
              💬 Mi Comunidad
            </button>
          </div>
          
          {/* Contenido de pestañas */}
          <div className="p-6">
            {activeTab === 'conocimiento' && (
              <ConocimientoTab data={conocimientoData} />
            )}
            {activeTab === 'comunidad' && (
              <ComunidadTab data={comunidadData} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

#### **2.2 Componente Pestaña Conocimiento**
```typescript
// frontend/src/components/profile/ConocimientoTab.tsx
export default function ConocimientoTab({ data }) {
  if (!data) return <div>Cargando...</div>;
  
  return (
    <div className="space-y-6">
      {/* Resumen de Conocimiento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500 rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-blue-600">{data.puntos_conocimiento}</h3>
              <p className="text-blue-700">Puntos de Conocimiento</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500 rounded-lg">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-green-600 capitalize">{data.nivel_conocimiento}</h3>
              <p className="text-green-700">Nivel Educativo</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500 rounded-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-purple-600">{data.contribuciones_aprobadas}</h3>
              <p className="text-purple-700">Contribuciones Aprobadas</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Progreso hacia siguiente nivel */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold mb-4">Progreso hacia {getNextLevel(data.nivel_conocimiento)}</h3>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${getProgressPercentage(data.puntos_conocimiento, data.nivel_conocimiento)}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {getPointsToNextLevel(data.puntos_conocimiento, data.nivel_conocimiento)} puntos para el siguiente nivel
        </p>
      </div>
      
      {/* Logros de Conocimiento */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold mb-4">🏆 Logros de Conocimiento</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.logros_conocimiento?.map(logro => (
            <div key={logro.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-2xl">{logro.icono}</span>
              <div>
                <h4 className="font-medium">{logro.nombre}</h4>
                <p className="text-sm text-gray-600">{logro.descripcion}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Historial de Conocimiento */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold mb-4">📚 Historial de Conocimiento</h3>
        <div className="space-y-3">
          {data.historial_conocimiento?.map(item => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-green-500">+{item.puntos_ganados}</span>
                <span>{item.motivo}</span>
              </div>
              <span className="text-sm text-gray-500">{formatDate(item.fecha_creacion)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

#### **2.3 Componente Pestaña Comunidad**
```typescript
// frontend/src/components/profile/ComunidadTab.tsx
export default function ComunidadTab({ data }) {
  if (!data) return <div>Cargando...</div>;
  
  return (
    <div className="space-y-6">
      {/* Resumen de Comunidad */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-pink-500 rounded-lg">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-pink-600">{data.experiencia_social}</h3>
              <p className="text-pink-700">Experiencia Social</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-500 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-orange-600 capitalize">{data.nivel_comunidad}</h3>
              <p className="text-orange-700">Nivel Social</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-500 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-indigo-600">#{data.ranking_semanal}</h3>
              <p className="text-indigo-700">Ranking Semanal</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Estadísticas de Interacciones */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4 text-center">
          <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <h4 className="text-2xl font-bold text-red-600">{data.likes_recibidos}</h4>
          <p className="text-sm text-gray-600">Likes Recibidos</p>
        </div>
        
        <div className="bg-white rounded-xl border p-4 text-center">
          <MessageCircle className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <h4 className="text-2xl font-bold text-blue-600">{data.comentarios_realizados}</h4>
          <p className="text-sm text-gray-600">Comentarios</p>
        </div>
        
        <div className="bg-white rounded-xl border p-4 text-center">
          <Share className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <h4 className="text-2xl font-bold text-green-600">{data.contenido_compartido}</h4>
          <p className="text-sm text-gray-600">Compartidos</p>
        </div>
        
        <div className="bg-white rounded-xl border p-4 text-center">
          <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <h4 className="text-2xl font-bold text-yellow-600">#{data.ranking_mensual}</h4>
          <p className="text-sm text-gray-600">Ranking Mensual</p>
        </div>
      </div>
      
      {/* Logros de Comunidad */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold mb-4">🏆 Logros de Comunidad</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.logros_comunidad?.map(logro => (
            <div key={logro.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-2xl">{logro.icono}</span>
              <div>
                <h4 className="font-medium">{logro.nombre}</h4>
                <p className="text-sm text-gray-600">{logro.descripcion}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Historial de Comunidad */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold mb-4">💬 Historial de Comunidad</h3>
        <div className="space-y-3">
          {data.historial_comunidad?.map(item => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-pink-500">+{item.puntos_ganados}</span>
                <span>{item.motivo}</span>
              </div>
              <span className="text-sm text-gray-500">{formatDate(item.fecha_creacion)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## 🎯 **BENEFICIOS DE ESTA IMPLEMENTACIÓN**

### **✅ Para el Usuario:**
- **Un solo perfil** (no confusión)
- **Dos sistemas claros** (conocimiento vs comunidad)
- **Progreso independiente** para cada área
- **Logros específicos** por sistema

### **✅ Para el Desarrollo:**
- **Mantiene BD actual** (no rompe nada)
- **APIs específicas** para cada sistema
- **Componentes reutilizables**
- **Fácil mantenimiento**

### **✅ Para el Negocio:**
- **Gamificación clara** por objetivos
- **Motivación específica** por área
- **Analytics separados** por sistema
- **Escalabilidad** para nuevos tipos de puntos

---

## 🚀 **¿EMPEZAMOS?**

**¿Te parece bien este plan?** 

1. **Mantener perfil único** ✅
2. **Dos pestañas separadas** ✅  
3. **Datos específicos por sistema** ✅
4. **No romper nada existente** ✅

**¿Quieres que implemente esto paso a paso?** 🚀
