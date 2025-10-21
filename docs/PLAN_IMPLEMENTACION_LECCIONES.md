# 📋 Plan de Implementación - Sistema de Lecciones

## 🎯 Objetivo
Implementar el sistema completo de lecciones mejorado en 4 fases.

---

## ✅ FASE 1: Base de Datos (15 minutos)

### **Paso 1.1: Ejecutar migración SQL**

1. Abre **Supabase Dashboard**
2. Ve a **SQL Editor**
3. Copia el contenido de `data/migracion_lecciones_mejoradas.sql`
4. Pega y ejecuta
5. Verifica que no haya errores

**Verificación:**
```sql
-- Debe mostrar las nuevas columnas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'lecciones' 
  AND column_name IN ('es_publica', 'es_exclusiva_modulo', 'modulo_exclusivo_id');

-- Debe mostrar la nueva tabla
SELECT * FROM modulos_lecciones LIMIT 1;
```

✅ **Completado cuando:** Las queries de verificación funcionan sin errores.

---

## ✅ FASE 2: Backend - Rutas (10 minutos)

### **Paso 2.1: Agregar rutas al servidor**

Edita `backend/src/index.js` y agrega:

```javascript
// Importar controlador
const modulosLeccionesController = require('./controllers/modulosLeccionesController');

// ========== RUTAS DE MÓDULOS-LECCIONES ==========

// Obtener lecciones de un módulo
app.get('/api/modulos/:moduloId/lecciones', 
  authMiddleware, 
  modulosLeccionesController.obtenerLeccionesModulo
);

// Vincular lección existente a módulo
app.post('/api/modulos/:moduloId/lecciones/vincular', 
  authMiddleware, 
  modulosLeccionesController.vincularLeccionExistente
);

// Crear lección exclusiva para módulo
app.post('/api/modulos/:moduloId/lecciones/crear', 
  authMiddleware, 
  modulosLeccionesController.crearLeccionExclusiva
);

// Desvincular lección de módulo
app.delete('/api/modulos/:moduloId/lecciones/:leccionId', 
  authMiddleware, 
  modulosLeccionesController.desvincularLeccion
);

// Actualizar configuración de lección en módulo
app.put('/api/modulos/:moduloId/lecciones/:leccionId', 
  authMiddleware, 
  modulosLeccionesController.actualizarConfiguracionLeccion
);

// Registrar progreso con contexto
app.post('/api/lecciones/:id/progreso', 
  authMiddleware, 
  modulosLeccionesController.registrarProgresoConContexto
);
```

### **Paso 2.2: Reiniciar backend**

```bash
cd backend
npm start
```

**Verificación:**
```bash
# Debe responder con 401 (no autenticado) o 200
curl http://localhost:3001/api/modulos/test-id/lecciones
```

✅ **Completado cuando:** El servidor inicia sin errores.

---

## ✅ FASE 3: Frontend - Componentes (2-3 horas)

### **Paso 3.1: Crear Modal de Agregar Lecciones** (30 min)

**Archivo:** `frontend/src/components/cursos/AgregarLeccionModal.tsx`

```tsx
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BuscadorLecciones from './BuscadorLecciones';
import FormularioLeccionExclusiva from './FormularioLeccionExclusiva';

interface AgregarLeccionModalProps {
  isOpen: boolean;
  onClose: () => void;
  moduloId: string;
  cursoId: string;
  onLeccionAgregada: () => void;
}

export default function AgregarLeccionModal({
  isOpen,
  onClose,
  moduloId,
  cursoId,
  onLeccionAgregada
}: AgregarLeccionModalProps) {
  const [activeTab, setActiveTab] = useState('vincular');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar Lección al Módulo</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="vincular">
              🔗 Vincular Existente
            </TabsTrigger>
            <TabsTrigger value="crear">
              ✨ Crear Exclusiva
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vincular">
            <BuscadorLecciones
              moduloId={moduloId}
              onLeccionVinculada={() => {
                onLeccionAgregada();
                onClose();
              }}
            />
          </TabsContent>

          <TabsContent value="crear">
            <FormularioLeccionExclusiva
              moduloId={moduloId}
              cursoId={cursoId}
              onLeccionCreada={() => {
                onLeccionAgregada();
                onClose();
              }}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
```

### **Paso 3.2: Crear Buscador de Lecciones** (45 min)

**Archivo:** `frontend/src/components/cursos/BuscadorLecciones.tsx`

```tsx
'use client';

import { useState, useEffect } from 'react';
import { Search, BookOpen, Clock, Award } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Leccion {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  nivel: string;
  duracion_estimada: number;
  estudiantes_completados: number;
  puntuacion_promedio: number;
}

export default function BuscadorLecciones({ 
  moduloId, 
  onLeccionVinculada 
}: { 
  moduloId: string; 
  onLeccionVinculada: () => void;
}) {
  const [lecciones, setLecciones] = useState<Leccion[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('todas');
  const [nivel, setNivel] = useState('todos');
  const [isLoading, setIsLoading] = useState(false);
  const [vinculando, setVinculando] = useState<string | null>(null);

  useEffect(() => {
    fetchLecciones();
  }, [categoria, nivel]);

  const fetchLecciones = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoria !== 'todas') params.append('categoria', categoria);
      if (nivel !== 'todos') params.append('nivel', nivel);
      
      const response = await fetch(`/api/lecciones?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLecciones(data.lecciones || []);
      }
    } catch (error) {
      console.error('Error al obtener lecciones:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const vincularLeccion = async (leccionId: string) => {
    setVinculando(leccionId);
    try {
      const response = await fetch(`/api/modulos/${moduloId}/lecciones/vincular`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          leccion_id: leccionId,
          orden_en_modulo: 1,
          es_obligatoria: true
        })
      });

      if (response.ok) {
        onLeccionVinculada();
      } else {
        const error = await response.json();
        alert(error.error || 'Error al vincular lección');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al vincular lección');
    } finally {
      setVinculando(null);
    }
  };

  const leccionesFiltradas = lecciones.filter(leccion =>
    leccion.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
    leccion.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar lecciones..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="todas">Todas las categorías</option>
          <option value="numeros">Números</option>
          <option value="colores">Colores</option>
          <option value="familia">Familia</option>
          <option value="naturaleza">Naturaleza</option>
          <option value="gramatica">Gramática</option>
          <option value="cultura">Cultura</option>
        </select>
        <select
          value={nivel}
          onChange={(e) => setNivel(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="todos">Todos los niveles</option>
          <option value="principiante">Principiante</option>
          <option value="intermedio">Intermedio</option>
          <option value="avanzado">Avanzado</option>
        </select>
      </div>

      {/* Lista de lecciones */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {isLoading ? (
          <p className="text-center py-8 text-gray-500">Cargando lecciones...</p>
        ) : leccionesFiltradas.length === 0 ? (
          <p className="text-center py-8 text-gray-500">No se encontraron lecciones</p>
        ) : (
          leccionesFiltradas.map(leccion => (
            <div
              key={leccion.id}
              className="p-4 border rounded-lg hover:border-primary transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-lg">{leccion.titulo}</h4>
                  <p className="text-sm text-gray-600 mt-1">{leccion.descripcion}</p>
                  
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary">{leccion.categoria}</Badge>
                    <Badge variant="outline">{leccion.nivel}</Badge>
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      {leccion.duracion_estimada} min
                    </span>
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      <Award className="w-4 h-4" />
                      {leccion.puntuacion_promedio.toFixed(1)}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => vincularLeccion(leccion.id)}
                  disabled={vinculando === leccion.id}
                  size="sm"
                >
                  {vinculando === leccion.id ? 'Vinculando...' : 'Vincular'}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
```

### **Paso 3.3: Crear Formulario de Lección Exclusiva** (45 min)

**Archivo:** `frontend/src/components/cursos/FormularioLeccionExclusiva.tsx`

```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function FormularioLeccionExclusiva({
  moduloId,
  cursoId,
  onLeccionCreada
}: {
  moduloId: string;
  cursoId: string;
  onLeccionCreada: () => void;
}) {
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    categoria: 'vocabulario',
    nivel: 'principiante',
    contenido_texto: '',
    contenido_nahuatl: '',
    duracion_estimada: 15,
    es_obligatoria: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/modulos/${moduloId}/lecciones/crear`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        onLeccionCreada();
      } else {
        const error = await response.json();
        alert(error.error || 'Error al crear lección');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al crear lección');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Título *</label>
        <Input
          value={formData.titulo}
          onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
          placeholder="Ej: Introducción al módulo"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Descripción</label>
        <Textarea
          value={formData.descripcion}
          onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
          placeholder="Breve descripción de la lección"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Categoría *</label>
          <select
            value={formData.categoria}
            onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            required
          >
            <option value="vocabulario">Vocabulario</option>
            <option value="numeros">Números</option>
            <option value="colores">Colores</option>
            <option value="familia">Familia</option>
            <option value="naturaleza">Naturaleza</option>
            <option value="gramatica">Gramática</option>
            <option value="cultura">Cultura</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Nivel *</label>
          <select
            value={formData.nivel}
            onChange={(e) => setFormData({ ...formData, nivel: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            required
          >
            <option value="principiante">Principiante</option>
            <option value="intermedio">Intermedio</option>
            <option value="avanzado">Avanzado</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Contenido en Español *</label>
        <Textarea
          value={formData.contenido_texto}
          onChange={(e) => setFormData({ ...formData, contenido_texto: e.target.value })}
          placeholder="Contenido de la lección en español"
          rows={6}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Contenido en Náhuatl</label>
        <Textarea
          value={formData.contenido_nahuatl}
          onChange={(e) => setFormData({ ...formData, contenido_nahuatl: e.target.value })}
          placeholder="Contenido de la lección en náhuatl (opcional)"
          rows={6}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="obligatoria"
          checked={formData.es_obligatoria}
          onChange={(e) => setFormData({ ...formData, es_obligatoria: e.target.checked })}
        />
        <label htmlFor="obligatoria" className="text-sm">
          Lección obligatoria para completar el módulo
        </label>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creando...' : 'Crear Lección Exclusiva'}
        </Button>
      </div>
    </form>
  );
}
```

✅ **Completado cuando:** Los 3 componentes están creados y sin errores de TypeScript.

---

## ✅ FASE 4: Integración (1 hora)

### **Paso 4.1: Actualizar página del módulo**

**Archivo:** `frontend/src/app/cursos/[id]/modulos/[moduloId]/page.tsx`

Agregar botón y modal:

```tsx
import AgregarLeccionModal from '@/components/cursos/AgregarLeccionModal';

// En el componente:
const [modalOpen, setModalOpen] = useState(false);

// En el JSX:
<Button onClick={() => setModalOpen(true)}>
  ➕ Agregar Lección
</Button>

<AgregarLeccionModal
  isOpen={modalOpen}
  onClose={() => setModalOpen(false)}
  moduloId={moduloId}
  cursoId={cursoId}
  onLeccionAgregada={() => {
    // Recargar lecciones
    fetchLecciones();
  }}
/>
```

### **Paso 4.2: Actualizar página de lección con contexto**

**Archivo:** `frontend/src/app/lecciones/[id]/page.tsx`

```tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';

export default function LeccionPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const from = searchParams.get('from');
  const moduloId = searchParams.get('moduloId');
  const cursoId = searchParams.get('cursoId');

  const handleSalir = () => {
    if (from === 'modulo' && moduloId && cursoId) {
      router.push(`/cursos/${cursoId}/modulos/${moduloId}`);
    } else {
      router.push('/lecciones');
    }
  };

  // Registrar progreso con contexto
  const registrarProgreso = async (estado: string) => {
    await fetch(`/api/lecciones/${params.id}/progreso`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        contexto_acceso: from || 'catalogo',
        modulo_id: moduloId,
        curso_id: cursoId,
        estado_leccion: estado
      })
    });
  };

  return (
    <div>
      {/* Breadcrumbs */}
      <nav className="mb-4">
        {from === 'modulo' ? (
          <span>Mis Cursos → Curso → Módulo → Lección</span>
        ) : (
          <span>Lecciones → Lección</span>
        )}
      </nav>

      {/* Contenido de la lección */}
      {/* ... */}

      {/* Botón salir */}
      <Button onClick={handleSalir}>
        ← Salir
      </Button>
    </div>
  );
}
```

✅ **Completado cuando:** La navegación funciona correctamente desde ambos contextos.

---

## 🧪 FASE 5: Testing (30 min)

### **Test 1: Vincular lección existente**
1. Ve a un módulo
2. Click en "Agregar Lección"
3. Tab "Vincular Existente"
4. Busca y selecciona una lección
5. Click "Vincular"
6. ✅ La lección aparece en el módulo

### **Test 2: Crear lección exclusiva**
1. Ve a un módulo
2. Click en "Agregar Lección"
3. Tab "Crear Exclusiva"
4. Llena el formulario
5. Click "Crear"
6. ✅ La lección aparece en el módulo
7. ✅ NO aparece en `/lecciones`

### **Test 3: Navegación contextual**
1. Entra a una lección desde el módulo
2. ✅ URL tiene `?from=modulo&moduloId=...`
3. Click "Salir"
4. ✅ Vuelve al módulo (no a `/lecciones`)

### **Test 4: Progreso compartido**
1. Completa una lección desde `/lecciones`
2. Inscríbete en un curso que tenga esa lección
3. ✅ Aparece como "Ya completada"

---

## 📊 Checklist Final

- [ ] Migración SQL ejecutada
- [ ] Rutas agregadas al backend
- [ ] Backend reiniciado sin errores
- [ ] Componentes creados
- [ ] Páginas actualizadas
- [ ] Test 1 pasado
- [ ] Test 2 pasado
- [ ] Test 3 pasado
- [ ] Test 4 pasado

---

## 🎉 ¡Sistema Completo!

Cuando todos los tests pasen, el sistema estará 100% funcional.

**Próximos pasos opcionales:**
- Agregar animaciones
- Mejorar UX con drag & drop para ordenar
- Agregar analytics de uso
- Implementar notificaciones

---

**¿Listo para empezar?** 🚀

Comienza con la **Fase 1** y avanza paso a paso.
