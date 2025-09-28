# 🏗️ Nueva Estructura del Proyecto Nawatlahtol

## 📁 **Estructura Propuesta (Escalable y Profesional)**

```
nahuatl-web/
├── 📋 docs/                           # Documentación centralizada
│   ├── README.md                      # Documentación principal
│   ├── API.md                         # Documentación de API
│   ├── DEPLOYMENT.md                  # Guía de despliegue
│   ├── CONTRIBUTING.md                # Guía de contribución
│   └── ARCHITECTURE.md                # Arquitectura del sistema
│
├── 🎨 frontend/                       # Aplicación Next.js
│   ├── 📦 package.json
│   ├── ⚙️ next.config.ts
│   ├── 🎨 tailwind.config.js
│   ├── 📘 tsconfig.json
│   ├── 📁 public/                     # Recursos estáticos
│   │   ├── 🌸 logo.png
│   │   ├── 📸 screenshots/
│   │   └── 🎨 icons/
│   │
│   └── 💻 src/                        # Código fuente
│       ├── 📱 app/                    # App Router (Next.js 13+)
│       │   ├── 🌟 (routes)/          # Páginas principales
│       │   │   ├── page.tsx          # Landing page
│       │   │   ├── diccionario/
│       │   │   ├── dashboard/
│       │   │   ├── contribuir/
│       │   │   ├── lecciones/
│       │   │   ├── feedback/
│       │   │   ├── admin/
│       │   │   └── profile/
│       │   ├── 🔐 auth/               # Autenticación
│       │   ├── 📄 legal/              # Páginas legales
│       │   │   ├── privacy/
│       │   │   ├── terms/
│       │   │   └── cookies/
│       │   ├── 🎨 globals.css
│       │   ├── 📱 layout.tsx
│       │   └── 🚫 not-found.tsx
│       │
│       ├── 🧩 components/             # Componentes reutilizables
│       │   ├── 🎨 ui/                # Componentes base
│       │   │   ├── Button.tsx
│       │   │   ├── Input.tsx
│       │   │   ├── Modal.tsx
│       │   │   ├── Card.tsx
│       │   │   └── Badge.tsx
│       │   ├── 🧭 navigation/        # Navegación
│       │   │   ├── Header.tsx
│       │   │   ├── Footer.tsx
│       │   │   ├── Navbar.tsx
│       │   │   └── ConditionalHeader.tsx
│       │   ├── 🎯 features/          # Componentes por funcionalidad
│       │   │   ├── auth/            # Autenticación
│       │   │   ├── dictionary/      # Diccionario
│       │   │   ├── lessons/         # Lecciones
│       │   │   ├── contributions/   # Contribuciones
│       │   │   ├── admin/           # Administración
│       │   │   ├── social/          # Red social
│       │   │   └── rewards/         # Sistema de recompensas
│       │   ├── 🎨 effects/          # Efectos visuales
│       │   │   ├── AnimatedBackground.tsx
│       │   │   ├── TextEffects.tsx
│       │   │   └── PremiumEffects.tsx
│       │   └── 🧩 shared/           # Componentes compartidos
│       │       ├── Quiz.tsx
│       │       ├── ThemeToggle.tsx
│       │       └── LogoutButton.tsx
│       │
│       ├── 🎣 hooks/                 # Custom hooks
│       │   ├── useAuth.ts
│       │   ├── useSocial.ts
│       │   ├── useContributions.ts
│       │   ├── useDictionary.ts
│       │   └── useAnimations.ts
│       │
│       ├── 🛠️ lib/                   # Utilidades y configuraciones
│       │   ├── 🔧 config/           # Configuraciones
│       │   │   ├── database.ts
│       │   │   ├── auth.ts
│       │   │   └── api.ts
│       │   ├── 🧮 utils/            # Funciones utilitarias
│       │   │   ├── helpers.ts
│       │   │   ├── validators.ts
│       │   │   └── formatters.ts
│       │   ├── 🎨 styles/           # Estilos y temas
│       │   │   ├── themes.ts
│       │   │   └── animations.ts
│       │   └── 📊 constants/        # Constantes
│       │       ├── api.ts
│       │       ├── routes.ts
│       │       └── messages.ts
│       │
│       ├── 🔌 services/             # Servicios de API
│       │   ├── api/                 # Cliente API
│       │   │   ├── client.ts
│       │   │   ├── auth.ts
│       │   │   ├── dictionary.ts
│       │   │   ├── contributions.ts
│       │   │   └── admin.ts
│       │   ├── 🗄️ database/         # Servicios de base de datos
│       │   │   ├── supabase.ts
│       │   │   └── queries.ts
│       │   └── 🔔 notifications/     # Servicios de notificaciones
│       │       └── push.ts
│       │
│       ├── 📊 types/                 # Definiciones de tipos
│       │   ├── index.ts
│       │   ├── api.ts
│       │   ├── auth.ts
│       │   ├── dictionary.ts
│       │   └── contributions.ts
│       │
│       ├── 🧪 __tests__/             # Pruebas
│       │   ├── components/
│       │   ├── hooks/
│       │   ├── services/
│       │   └── utils/
│       │
│       └── 📱 middleware.ts
│
├── 🔧 backend/                       # Servidor API Express.js
│   ├── 📦 package.json
│   ├── 📜 index.js
│   ├── 📖 README.md
│   │
│   ├── 🗂️ src/                       # Código fuente del backend
│   │   ├── 🎯 controllers/          # Controladores
│   │   │   ├── authController.js
│   │   │   ├── dictionaryController.js
│   │   │   ├── contributionsController.js
│   │   │   ├── adminController.js
│   │   │   ├── socialController.js
│   │   │   └── rewardsController.js
│   │   │
│   │   ├── 🛣️ routes/               # Rutas de API
│   │   │   ├── index.js
│   │   │   ├── auth.js
│   │   │   ├── dictionary.js
│   │   │   ├── contributions.js
│   │   │   ├── admin.js
│   │   │   ├── social.js
│   │   │   └── rewards.js
│   │   │
│   │   ├── 🛠️ services/             # Lógica de negocio
│   │   │   ├── authService.js
│   │   │   ├── dictionaryService.js
│   │   │   ├── contributionsService.js
│   │   │   ├── adminService.js
│   │   │   ├── socialService.js
│   │   │   └── rewardsService.js
│   │   │
│   │   ├── 🛡️ middleware/           # Middleware
│   │   │   ├── auth.js
│   │   │   ├── validation.js
│   │   │   ├── errorHandler.js
│   │   │   └── rateLimiter.js
│   │   │
│   │   ├── 🔧 config/               # Configuraciones
│   │   │   ├── database.js
│   │   │   ├── environment.js
│   │   │   ├── googleOAuth.js
│   │   │   └── cors.js
│   │   │
│   │   ├── 🧮 utils/                # Utilidades
│   │   │   ├── helpers.js
│   │   │   ├── validators.js
│   │   │   ├── formatters.js
│   │   │   └── logger.js
│   │   │
│   │   ├── 📊 types/                 # Tipos (si usas TypeScript)
│   │   │   ├── index.ts
│   │   │   ├── auth.ts
│   │   │   └── api.ts
│   │   │
│   │   └── 🧪 __tests__/            # Pruebas del backend
│   │       ├── controllers/
│   │       ├── services/
│   │       └── middleware/
│   │
│   ├── 📁 data/                      # Datos estáticos
│   │   ├── dictionary.json
│   │   ├── lecciones.json
│   │   └── vocabulario.json
│   │
│   ├── 🗄️ migrations/               # Migraciones de BD
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_add_contributions.sql
│   │   └── 003_add_social_features.sql
│   │
│   └── 📁 scripts/                   # Scripts de utilidad
│       ├── migrate.js
│       ├── seed.js
│       └── backup.js
│
├── 🗄️ database/                      # Base de datos
│   ├── 📋 schema/                    # Esquemas
│   │   ├── initial.sql
│   │   ├── contributions.sql
│   │   └── social.sql
│   ├── 🌱 seeds/                     # Datos iniciales
│   │   ├── users.sql
│   │   ├── dictionary.sql
│   │   └── lessons.sql
│   └── 🔄 migrations/               # Migraciones
│       └── README.md
│
├── 🚀 deployment/                    # Configuración de despliegue
│   ├── 🐳 docker/                   # Docker
│   │   ├── Dockerfile.frontend
│   │   ├── Dockerfile.backend
│   │   └── docker-compose.yml
│   ├── ☁️ vercel/                   # Vercel
│   │   └── vercel.json
│   ├── 🌐 render/                   # Render
│   │   └── render.yaml
│   └── 📊 monitoring/               # Monitoreo
│       ├── sentry.js
│       └── analytics.js
│
├── 🧪 tests/                        # Pruebas globales
│   ├── e2e/                         # Pruebas end-to-end
│   ├── integration/                 # Pruebas de integración
│   └── fixtures/                    # Datos de prueba
│
├── 📁 scripts/                      # Scripts globales
│   ├── setup.sh                     # Configuración inicial
│   ├── deploy.sh                    # Despliegue
│   └── backup.sh                    # Respaldo
│
├── 📋 .github/                      # GitHub Actions
│   └── workflows/
│       ├── ci.yml
│       ├── deploy.yml
│       └── test.yml
│
├── 📄 .env.example                  # Variables de entorno
├── 📄 .gitignore
├── 📄 package.json                  # Scripts globales
└── 📄 README.md                     # Documentación principal
```

## 🎯 **Beneficios de esta Estructura**

### ✅ **Escalabilidad**
- **Separación clara** de responsabilidades
- **Fácil agregar** nuevas funcionalidades
- **Mantenimiento** simplificado

### ✅ **Organización**
- **Componentes agrupados** por funcionalidad
- **Servicios centralizados**
- **Configuraciones separadas**

### ✅ **Colaboración**
- **Estructura estándar** de la industria
- **Fácil onboarding** de nuevos desarrolladores
- **Documentación clara**

### ✅ **Testing**
- **Pruebas organizadas** por módulo
- **Fixtures centralizadas**
- **Cobertura completa**

## 🚀 **Plan de Migración**

### **Fase 1: Reorganizar Frontend**
1. Crear nueva estructura de carpetas
2. Mover componentes por funcionalidad
3. Actualizar imports
4. Probar funcionalidad

### **Fase 2: Reorganizar Backend**
1. Crear estructura src/
2. Mover archivos por responsabilidad
3. Actualizar rutas
4. Probar endpoints

### **Fase 3: Documentación**
1. Actualizar README.md
2. Crear guías de desarrollo
3. Documentar arquitectura

¿Te parece bien esta estructura? ¿Quieres que empecemos con la reorganización?
