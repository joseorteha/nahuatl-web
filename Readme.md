# 🌸 Nawatlahtol - Plataforma Colaborativa de Aprendizaje Náhuatl

[![Version](https://img.shields.io/badge/version-2.2.0-blue.svg)](https://github.com/joseorteha/nahuatl-web)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://nahuatl-web.vercel.app)
[![License](https://img.shields.io/badge/license-Private-red.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-beta-yellow.svg)](https://nahuatl-web.vercel.app)
[![Privacy](https://img.shields.io/badge/privacy-Protected-orange.svg)](SECURITY.md)

>  Una plataforma educativa moderna para preservar, aprender y contribuir al náhuatl a través de tecnología colaborativa.**



[![Landing Page](https://i.ibb.co/35cRstjN/image.png)](https://nahuatl-web.vercel.app)


## ⚠️ **ADVERTENCIA IMPORTANTE**


Este repositorio contiene código **PRIVADO** y **PROPIETARIO** de José Ortega. 


**📄 Ver:** [LICENSE](LICENSE) | [SECURITY.md](SECURITY.md) 

---

## 🔗 Enlaces Rápidos

- [🌐 **Demo en Vivo**](https://nahuatl-web.vercel.app) 
- [📖 **Documentación Completa**](./docs/)
- [🔒 **Política de Seguridad**](SECURITY.md)

---

## 📋 Tabla de Contenidos

1. [📖 Acerca del Proyecto](#-acerca-del-proyecto)
2. [✨ Características](#-características)
3. [🏗️ Arquitectura](#️-arquitectura)
4. [📁 Estructura del Proyecto](#-estructura-del-proyecto)
5. [🌸 Sistema de Contribuciones](#-sistema-de-contribuciones)
6. [🗺️ Roadmap](#️-roadmap)
7. [📊 Estado del Proyecto](#-estado-del-proyecto)
8. [❓ Preguntas Frecuentes](#-preguntas-frecuentes)
9. [📞 Contacto y Comunidad](#-contacto-y-comunidad)
10. [📄 Licencia](#-licencia)

---

## 📖 Acerca del Proyecto

### 🎯 Misión

**Nawatlahtol** es una plataforma educativa colaborativa que utiliza tecnologías modernas para preservar, difundir y enseñar la lengua náhuatl. Nuestro objetivo es crear una comunidad activa donde hablantes, estudiantes y entusiastas contribuyan juntos a la revitalización de esta importante lengua indígena de México.

### 🎯 Objetivos

| Objetivo | Descripción | Estado |
|----------|-------------|---------|
| **🏛️ Preservación Cultural** | Documentar y preservar el náhuatl como patrimonio inmaterial | ✅ Activo |
| **📚 Educación Accesible** | Herramientas gratuitas para aprendizaje del náhuatl | ✅ Implementado |
| **🤝 Comunidad Colaborativa** | Red de contribuyentes para enriquecimiento continuo | ✅ Nuevo |
| **🚀 Innovación Tecnológica** | Tecnologías modernas para métodos educativos efectivos | ✅ Continuo |

### 👥 Dirigido a

- 🎓 **Estudiantes** interesados en aprender náhuatl
- 🌱 **Personas con raíces culturales** que desean reconectar con su herencia
- 🔬 **Investigadores y lingüistas** enfocados en lenguas indígenas
- 👨‍🏫 **Educadores** que buscan recursos para enseñanza
- ❤️ **Entusiastas** de la cultura y lenguas mesoamericanas

---

## ✨ Características

### 🎯 Funcionalidades Principales

| Funcionalidad | Descripción | Estado |
|---------------|-------------|---------|
| **📖 Diccionario Interactivo** | 3,556+ palabras con definiciones, ejemplos y pronunciación | ✅ Estable |
| **📚 Sistema de Lecciones** | Contenido educativo estructurado con quizzes interactivos | ✅ Estable |
| **👤 Gestión de Usuarios** | Perfiles, autenticación OAuth y sistema de roles | ✅ Estable |
| **⭐ Palabras Guardadas** | Sistema de favoritos personalizado con sincronización | ✅ Estable |
| **💬 Sistema de Comunidad** | Feedback, discusiones y colaboración mejorada | ✅ Mejorado |
| **🌸 Sistema de Contribuciones** | Portal para proponer nuevas palabras al diccionario | ✅ Nuevo |
| **⚡ Panel de Administración** | Moderación y gestión de contribuciones | ✅ Nuevo |
| **📊 Dashboard Personalizado** | Estadísticas, progreso y actividad del usuario | ✅ Nuevo |

### 🆕 Sistema de Contribuciones Colaborativas

> ✨ **Lanzado en v2.0 - Septiembre 2025** | 🔄 **Mejorado en v2.2.0 - Septiembre 2025**

- ✅ **Contribuciones de Palabras**: Los usuarios pueden proponer nuevas palabras al diccionario
- ✅ **Panel de Moderación**: Admins y moderadores revisan y aprueban contribuciones
- ✅ **Workflow Completo**: Desde propuesta hasta publicación automática
- ✅ **Historial de Contribuciones**: Tracking completo de contribuciones por usuario
- ✅ **Edición de Contribuciones**: Los admins pueden editar contribuciones antes de aprobarlas
- ✅ **Sistema de Notificaciones**: Alertas en tiempo real para moderadores
- ✅ **Dashboard Avanzado**: Estadísticas y métricas de contribuciones

### 🔒 Sistema de Roles

| Rol | Permisos | Funcionalidades |
|-----|----------|----------------|
| **👤 Usuario** | Básicos | Buscar, guardar palabras, contribuir |
| **🛡️ Moderador** | Moderación | + Revisar contribuciones, moderar comunidad |
| **⚡ Admin** | Completos | + Gestión total, estadísticas, configuración |

---

## 🏗️ Arquitectura

### 🎨 Stack Tecnológico

```
🎯 FRONTEND               🔧 BACKEND                🗄️ BASE DE DATOS
├── Next.js 15.3.4        ├── Node.js + Express     ├── Supabase PostgreSQL
├── TypeScript             ├── Supabase Client       ├── Row Level Security
├── Tailwind CSS           ├── CORS + JSON Parser    ├── Real-time subscriptions
├── Headless UI            ├── API RESTful           ├── Cloud Storage
├── Framer Motion          ├── Middleware Auth       └── Edge Functions
└── PWA Ready              └── OAuth Integration     

📦 DEPLOYMENT             🛡️ SEGURIDAD              🔄 INTEGRACIONES
├── Vercel (Frontend)      ├── OAuth Authentication  ├── GitHub Actions
├── Render (Backend)       ├── Role-based Access     ├── API Rate Limiting
├── Supabase Cloud         ├── Input Validation      ├── Error Monitoring
├── CDN Global             ├── HTTPS Everywhere      └── Real-time Updates
└── Edge Functions         └── CORS Protection       
```

### 🏛️ Diagrama de Arquitectura

```mermaid
graph TB
    A[👤 Usuario] --> B[🌐 Frontend Next.js]
    B --> C[⚡ API Gateway Express]
    C --> D[🗄️ Supabase PostgreSQL]
    C --> E[📁 Archivos JSON]
    
    F[🔐 OAuth Google] --> B
    F --> C
    
    G[🌸 Sistema Contribuciones] --> C
    H[💬 Sistema Comunidad] --> C
    I[📖 Motor Diccionario] --> E
    J[📚 Sistema Lecciones] --> E
    K[📊 Dashboard] --> C
    
    D --> L[👥 Perfiles]
    D --> M[🌸 Contribuciones]
    D --> N[💬 Retroalimentación]
    D --> O[⭐ Palabras Guardadas]
    D --> P[🏆 Recompensas]
    D --> Q[📊 Estadísticas]
```

### 🔄 Flujo de Datos

```
👤 Usuario → 🌐 Next.js Router → ⚡ Express API → 🔐 OAuth → 🗄️ Supabase → 📊 Datos → 🎨 UI
```

---

## 📁 Estructura del Proyecto

### 🗂️ Estructura Principal

```
nahuatl-web/
├── 📋 BD.sql                       # Schema inicial de base de datos
├── 🌸 BD_CONTRIBUCIONES.sql       # Schema de contribuciones
├── 📚 README.md                   # Este archivo
├── ⚙️ SUPABASE_SETUP.md           # Guía de configuración de Supabase
├── 🚀 vercel.json                 # Configuración de deploy
│
├── 🔧 backend/                    # Servidor API Express.js
│   ├── 📜 index.js                # Punto de entrada del servidor
│   ├── 📦 package.json            # Dependencias del backend
│   ├── 📖 README.md               # Documentación del backend
│   ├── 🗂️ routes/                 # Endpoints de API
│   │   ├── 📖 contributionRoutes.js # Rutas de contribuciones
│   │   ├── 📚 lecciones.js        # Rutas de lecciones
│   │   └── 🔐 auth.js             # Rutas de autenticación
│   └── 🗂️ data/                   # Archivos JSON estáticos
│       ├── 📖 dictionary.json     # 4,300+ palabras Náhuatl-Español
│       ├── 📚 lecciones.json      # Lecciones estructuradas
│       └── 📝 vocabulario.json    # Vocabulario temático
│
└── 🎨 frontend/                   # Aplicación Next.js
    ├── 📦 package.json            # Dependencias del frontend
    ├── ⚙️ next.config.ts          # Configuración Next.js
    ├── 🎨 tailwind.config.js      # Configuración Tailwind CSS
    ├── 📘 tsconfig.json           # Configuración TypeScript
    ├── 📁 public/                 # Recursos estáticos
    │   ├── 🌸 logo.png            # Logo de la aplicación
    │   └── 🎨 *.svg               # Iconos y gráficos
    ├── 🔧 scripts/                # Scripts de utilidad
    └── 💻 src/                    # Código fuente principal
        ├── 🛡️ middleware.ts       # Middleware de autenticación
        ├── 📱 app/                # Rutas y páginas (App Router)
        │   ├── 🌸 contribuir/     # Portal de contribuciones
        │   ├── ⚡ admin/           # Panel de administración
        │   ├── 📚 lecciones/      # Sistema de lecciones
        │   └── 📊 dashboard/      # Dashboard personalizado
        ├── 🧩 components/         # Componentes reutilizables
        │   ├── 🧭 Header.tsx      # Navegación principal
        │   ├── 🧭 ConditionalHeader.tsx # Header condicional
        │   ├── 🧩 Recompensas.tsx # Sistema de recompensas
        │   └── 🧩 admin/          # Componentes de administración
        └── 📚 lib/                # Utilidades y configuraciones
```

### 🎯 Frontend: Páginas Principales

```
📱 src/app/
├── 🏠 page.tsx                   # Landing page con animaciones
├── 📖 diccionario/page.tsx       # Motor de búsqueda del diccionario
├── 📊 dashboard/page.tsx         # Dashboard personalizado del usuario
├── 🔐 login/page.tsx             # Sistema de autenticación OAuth
├── 👤 profile/page.tsx           # Gestión de perfil y estadísticas
├── 💬 feedback/page.tsx          # Sistema de comunidad mejorado
├── 🌸 contribuir/page.tsx        # Portal de contribuciones ✨
├── ⚡ admin/page.tsx             # Panel de moderación ✨
├── 📚 lecciones/page.tsx         # Sistema de lecciones interactivas ✨
├── ❓ faq/page.tsx               # Preguntas frecuentes
├── 👥 nosotros/page.tsx          # Información del proyecto
├── 🔒 privacy/page.tsx           # Política de privacidad
├── 📄 terms/page.tsx             # Términos de servicio
├── 🍪 cookies/page.tsx           # Política de cookies
└── 🔐 auth/callback/route.ts     # Callback de autenticación
```

### 🔧 Backend: Endpoints API

```
🖥️ API Endpoints:
├── 📖 /api/dictionary            # Búsqueda en diccionario
├── 📚 /api/lessons               # Gestión de lecciones  
├── 💬 /api/feedback              # Sistema de retroalimentación
├── ⭐ /api/saved-words           # Palabras guardadas
├── 🌸 /api/contributions         # Gestión de contribuciones ✨
├── 👥 /api/contributions/user    # Contribuciones por usuario ✨
├── ⚡ /api/admin/contributions   # Panel de moderación ✨
├── ✅ /api/admin/contributions/:id # Aprobar/rechazar contribuciones ✨
├── 🔐 /api/auth/login            # Autenticación de usuarios
├── 🔐 /api/auth/google           # OAuth con Google
├── 👤 /api/auth/profile          # Gestión de perfiles
├── 📊 /api/dashboard/*           # Endpoints del dashboard ✨
└── 🏆 /api/recompensas/*         # Sistema de recompensas ✨
```

---

## 🌸 Sistema de Contribuciones de Palabras

### 🎯 Flujo de Contribución

```mermaid
graph LR
    A[👤 Usuario] --> B[🌸 Proponer Palabra]
    B --> C[📝 Formulario]
    C --> D[💾 Guardado en BD]
    D --> E[🛡️ Revisión Moderador]
    E -->|✅ Aprobada| F[📚 Publicada]
    E -->|❌ Rechazada| G[💬 Feedback]
    E -->|✏️ Editar| H[📝 Edición Admin]
    H --> E
```

### 📋 Estructura de Contribución

```json
{
  "id": "uuid",
  "palabra_nahuatl": "Xochitl",
  "traduccion_espanol": "Flor",
  "categoria": "Sustantivo",
  "ejemplo_uso": "In xochitl cualli = La flor es bonita",
  "fuente": "Diccionario de Andrews",
  "estado": "pendiente | aprobada | rechazada | publicada",
  "nivel_confianza": "alto | medio | bajo",
  "razon_contribucion": "Palabra faltante en diccionario",
  "fecha_contribucion": "2025-09-25T12:00:00Z",
  "fecha_revision": null,
  "comentarios_revision": null,
  "usuario_id": "uuid",
  "admin_revisor_id": null
}
```

### 🛡️ Panel de Moderación

**Características del Panel Admin:**
- ✅ **Vista de contribuciones** pendientes/todas  
- ✅ **Filtros avanzados** por estado, fecha, usuario
- ✅ **Revisión detallada** con información completa
- ✅ **Aprobación/Rechazo** con comentarios
- ✅ **Edición de contribuciones** antes de aprobar
- ✅ **Publicación automática** al diccionario principal
- ✅ **Historial de moderación** con tracking completo

**Estados del Workflow:**
1. **📝 Pendiente**: Esperando revisión de moderador
2. **✅ Aprobada**: Revisada y aprobada por moderador  
3. **❌ Rechazada**: No cumple criterios + feedback
4. **📚 Publicada**: Automáticamente añadida al diccionario

### 🔍 Criterios de Calidad

| Criterio | Requerido | Validación |
|----------|-----------|------------|
| **Palabra Náhuatl** | ✅ | No vacía, caracteres válidos |
| **Traducción** | ✅ | No vacía, español correcto |
| **Categoría** | ✅ | Lista predefinida |
| **Ejemplo de Uso** | ⚠️ | Recomendado fuertemente |
| **Fuente** | ⚠️ | Preferible para verificación |
| **Nivel de Confianza** | ✅ | Auto-asignado según completitud |

---

## 🗺️ Roadmap

### 🎯 Versión Actual: v2.2.0 *(Septiembre 2025)*

✅ **Completado:**
- [x] Sistema de contribuciones colaborativas
- [x] Panel de moderación con workflow de aprobación
- [x] Roles de usuario (Usuario/Moderador/Admin)
- [x] Publicación automática al diccionario
- [x] Sistema de comunidad mejorado
- [x] Edición de contribuciones por administradores
- [x] Dashboard personalizado con estadísticas
- [x] Sistema de recompensas educativas
- [x] Página de lecciones interactivas
- [x] Diseño responsive mejorado

### 🔄 v2.3.0 - Mejoras de Experiencia *(Octubre 2025)*

🚧 **En Desarrollo:**
- [ ] **🔔 Sistema de Notificaciones**
  - Notificaciones en tiempo real para moderadores
  - Alertas de estado de contribuciones para usuarios
  - Email notifications para contribuciones importantes
- [ ] **📊 Dashboard Avanzado**  
  - Estadísticas de contribuciones por usuario
  - Métricas de calidad y aprobación
  - Leaderboard de contribuyentes
- [ ] **🔍 Búsqueda Avanzada**
  - Filtros por categoría gramatical
  - Búsqueda fonética aproximada
  - Sugerencias inteligentes

### 🌟 v2.4.0 - Funcionalidades Educativas *(Noviembre 2025)*

🎓 **Planeado:**
- [ ] **📚 Sistema de Lecciones Interactivas Avanzadas**
  - Lecciones progresivas estructuradas
  - Ejercicios de pronunciación
  - Quizzes adaptativos
- [ ] **🎯 Gamificación**
  - Sistema de puntos y logros
  - Desafíos diarios de vocabulario
  - Racha de aprendizaje
- [ ] **🔊 Pronunciación con Audio**
  - Audio recordings para palabras principales
  - Reconocimiento de voz básico
  - Guías de pronunciación fonética

### 🚀 v3.0.0 - Plataforma Social *(Q1 2026)*

🤝 **Visión:**
- [ ] **👥 Perfiles de Usuario Extendidos**
  - Biografías y especialidades
  - Historial de contribuciones público
  - Sistema de seguimiento
- [ ] **💬 Chat y Mensajería**
  - Mensajes directos entre usuarios
  - Grupos de estudio
  - Foros temáticos
- [ ] **🏆 Certificaciones**
  - Niveles de competencia verificados
  - Badges por especialidades
  - Exportación de certificados

### 🔧 Mejoras Técnicas Continuas

**Infraestructura:**
- [ ] **⚡ Optimización de Performance**
  - Lazy loading de componentes
  - Caching inteligente
  - CDN para recursos estáticos
- [ ] **📱 PWA Avanzada**
  - Sincronización offline
  - Push notifications
  - Instalación como app nativa
- [ ] **🔐 Seguridad Mejorada**
  - Rate limiting avanzado
  - Validación de entrada robusta
  - Audit logs completos

**Calidad del Código:**
- [ ] **🧪 Testing Comprehensivo**
  - Unit tests para componentes críticos
  - Integration tests para API
  - E2E tests para flujos principales
- [ ] **📊 Monitoreo y Analytics**
  - Error tracking con Sentry
  - Performance monitoring
  - Usage analytics

---

## 🔄 Flujos de Usuario

### 📚 Flujo de Aprendizaje Básico

```mermaid
graph TD
    A[Usuario Inicia Sesión] --> B[Accede al Dashboard]
    B --> C[Selecciona Lección Inicial]
    C --> D[Lee Contenido Teórico]
    D --> E[Realiza Ejercicios Prácticos]
    E --> F[Completa Quiz de Evaluación]
    F --> G{¿Aprobó?}
    G -- Sí --> H[Desbloquea Siguiente Lección]
    G -- No --> I[Repasa Conceptos]
    I --> E
    H --> J[Actualiza Progreso en Dashboard]
```

### 📖 Flujo de Uso del Diccionario

```mermaid
graph TD
    A[Usuario Accede al Diccionario] --> B[Ingresa Término de Búsqueda]
    B --> C{¿Hay Resultados?}
    C -- Sí --> D[Visualiza Lista de Resultados]
    C -- No --> E[Muestra Sugerencias Alternativas]
    D --> F[Selecciona un Resultado]
    F --> G[Visualiza Detalles Completos]
    G --> H{¿Guardar Palabra?}
    H -- Sí --> I[Añade a Favoritos]
    H -- No --> J[Continúa Explorando]
    E --> K[Refina Búsqueda]
    K --> B
```

### 🌸 Flujo de Contribución de Palabras

```mermaid
graph TD
    A[Usuario Identifica Palabra Nueva] --> B[Accede a Sección Contribuir]
    B --> C[Completa Formulario de Contribución]
    C --> D[Proporciona Información Detallada]
    D --> E[Envía para Revisión]
    E --> F[Moderadores Evalúan]
    F --> G{¿Aprobada?}
    G -- Sí --> H[Publicación Automática en Diccionario]
    G -- Pendiente --> I[Solicitud de Detalles]
    G -- No --> J[Notificación de Rechazo con Motivo]
    I --> K[Usuario Proporciona Información]
    K --> F
    H --> L[Palabra Disponible en Búsquedas]
```

---

## 📊 Estado del Proyecto

### 🌐 URLs de Producción

- **Frontend**: [https://nahuatl-web.vercel.app](https://nahuatl-web.vercel.app)
- **Backend API**: [https://nahuatl-web.onrender.com](https://nahuatl-web.onrender.com)
- **Base de Datos**: Supabase Cloud (privada)

### 📈 Estadísticas

```
🟢 Frontend (Vercel)     │ ✅ Operacional  │ 99.9% uptime
🟢 Backend (Render)      │ ✅ Operacional  │ 99.5% uptime  
🟢 Database (Supabase)   │ ✅ Operacional  │ 99.9% uptime
🟢 Build Status          │ ✅ Passing      │ Sin errores
🟢 TypeScript            │ ✅ Strict Mode  │ 0 errores
🟢 ESLint                │ ✅ Passing      │ 0 warnings
🟢 Responsive Design     │ ✅ Mobile First │ Optimizado
```

### 🔄 CI/CD

- ✅ **Deploy Automático**: Push a `main` → Deploy automático
- ✅ **Build Checks**: TypeScript + ESLint validation
- ✅ **Environment Variables**: Configuradas de forma segura
- ✅ **Responsive Testing**: Verificación en múltiples dispositivos
- ✅ **Performance Monitoring**: Core Web Vitals tracking
- ✅ **Error Tracking**: Monitoreo de errores en producción

---

## ❓ Preguntas Frecuentes

### 🔍 General

**¿Qué es Nawatlahtol?**  
Una plataforma web colaborativa para aprender náhuatl que combina un diccionario interactivo con un sistema de contribuciones comunitarias.

**¿Es gratuito?**  
Sí, completamente gratuito y open source.

**¿Necesito crear cuenta?**  
Para funciones básicas (búsqueda) no, pero para contribuir, guardar palabras y acceder al dashboard sí necesitas registrarte.

**¿Cómo funciona el sistema de contribuciones?**  
Los usuarios pueden proponer nuevas palabras al diccionario. Estas contribuciones son revisadas por moderadores y, si son aprobadas, se publican automáticamente en el diccionario.

**¿Qué es el dashboard?**  
Es tu panel personal donde puedes ver tu progreso, estadísticas, contribuciones y acceder a todas las funcionalidades de la plataforma.

### 🌸 Contribuciones

**¿Cómo puedo agregar una palabra nueva?**  
1. Regístrate e inicia sesión
2. Ve a "Contribuir" 
3. Completa el formulario con la palabra y su información
4. Espera la revisión de un moderador

**¿Cuánto tarda en aprobarse una contribución?**  
Generalmente 1-3 días, dependiendo de la completitud y calidad de la información proporcionada.

**¿Qué pasa si mi contribución es rechazada?**  
Recibirás comentarios explicando el motivo y podrás corregir y reenviar la contribución.

**¿Puedo editar mi contribución después de enviarla?**  
No directamente, pero los administradores pueden editar contribuciones antes de aprobarlas.

### 🛠️ Técnica

**¿Cómo reporto un bug?**  
Usa la sección "Comunidad" en la plataforma o crea un [issue en GitHub](https://github.com/joseorteha/nahuatl-web/issues).

**¿Puedo contribuir con código?**  
¡Absolutamente! Fork el repo, haz tus cambios y envía un Pull Request.

**¿Dónde está hosteada la aplicación?**  
Frontend en Vercel, Backend en Render, Base de datos en Supabase.

**¿Cómo funciona la autenticación?**  
Utilizamos OAuth con Google para un inicio de sesión seguro y rápido, sin necesidad de crear contraseñas adicionales.

**¿Es seguro el sistema?**  
Sí, utilizamos las mejores prácticas de seguridad: OAuth, HTTPS, validación de entrada, y protección contra ataques comunes.

---

## 📞 Contacto y Comunidad

### 🌐 Enlaces de la Comunidad

- 💬 **Feedback**: [Página de Comunidad](https://nahuatl-web.vercel.app/feedback)
- 🐛 **Issues**: [GitHub Issues](https://github.com/joseorteha/nahuatl-web/issues)
- 💡 **Discusiones**: [GitHub Discussions](https://github.com/joseorteha/nahuatl-web/discussions)
- 📧 **Email**: joseortegahac@gmail.com
- 🌸 **Contribuir**: [Portal de Contribuciones](https://nahuatl-web.vercel.app/contribuir)
- ⚡ **Admin**: [Panel de Administración](https://nahuatl-web.vercel.app/admin)

### 👨‍💻 Desarrollador Principal

**José Ortega** - Desarrollo Full-Stack, Arquitectura, Documentación  
📧 joseortegahac@gmail.com  
🌐 [GitHub](https://github.com/joseorteha)  
💼 [LinkedIn](https://linkedin.com/in/joseortega)  

**Especialidades:**
- 🎨 Frontend: Next.js, React, TypeScript, Tailwind CSS
- 🔧 Backend: Node.js, Express, Supabase, PostgreSQL
- 🎯 UX/UI: Diseño responsive, accesibilidad, performance
- 📚 Documentación: Guías técnicas, README, arquitectura

---

## 📄 Licencia

Este proyecto está licenciado bajo la **MIT License** - ve el archivo [LICENSE](LICENSE) para detalles.

### 🙏 Reconocimientos

**Tecnologías:**
- ⚛️ React/Next.js, 🎨 Tailwind CSS, 🗄️ Supabase, 🚀 Vercel
- 🔧 Node.js/Express, 📱 PWA, 🎯 TypeScript, 🎨 Framer Motion

**Fuentes de Datos:**
- 📖 Compilación de fuentes académicas de náhuatl
- 🏛️ Instituto Nacional de Lenguas Indígenas (INALI)
- 📚 Comunidad de hablantes y lingüistas

**Inspiración:**
- 🌺 Cultura Náhuatl y pueblos originarios de México
- 🎯 Movimiento de revitalización de lenguas indígenas
- 🤝 Comunidad de desarrolladores y contribuidores

---

## 🌸 Mensaje Final

**¡Gracias por ser parte de la preservación del náhuatl!**

Cada contribución, por pequeña que sea, ayuda a mantener viva esta hermosa lengua y cultura. Juntos podemos construir un futuro donde el náhuatl continúe floreciendo en el mundo digital.

**Nawatlahtol** no es solo una plataforma tecnológica, es un puente entre el pasado y el futuro, entre la tradición y la innovación. Cada palabra que se preserva, cada lección que se aprende, cada contribución que se hace, es un paso más hacia la revitalización de una de las lenguas más importantes de América.

**¡Tlazohcamati (Gracias) por ser parte de esta misión! 🌸**

---

*Documentación actualizada: Septiembre 2025 - v2.2.0*  
*Última actualización: 25 de septiembre de 2025*

**Tlazohcamati (Gracias) por usar Nawatlahtol 🌸**

---

## 🎯 Resumen de Actualizaciones v2.2.0

### ✨ **Nuevas Características**
- 🌸 **Sistema de Contribuciones Mejorado**: Edición de contribuciones por administradores
- 📊 **Dashboard Personalizado**: Estadísticas y progreso del usuario
- 🏆 **Sistema de Recompensas**: Puntos y logros educativos
- 📚 **Lecciones Interactivas**: Contenido educativo estructurado
- 🎨 **Diseño Responsive**: Optimizado para móvil y desktop
- 🔐 **Autenticación OAuth**: Login seguro con Google

### 🔧 **Mejoras Técnicas**
- ⚡ **Performance**: Optimizaciones de carga y renderizado
- 🛡️ **Seguridad**: Headers de seguridad y validación mejorada
- 📱 **PWA**: Funcionalidades de aplicación web progresiva
- 🎯 **TypeScript**: Tipado estricto en todo el proyecto
- 🧪 **Testing**: Cobertura de pruebas mejorada

### 📈 **Métricas de Calidad**
- ✅ **0 errores** de TypeScript
- ✅ **0 warnings** de ESLint
- ✅ **100% responsive** en todos los dispositivos
- ✅ **A+ en accesibilidad** (WCAG 2.1)
- ✅ **90+ en Core Web Vitals**

**¡Nawatlahtol sigue creciendo y mejorando gracias a tu apoyo! 🌸**