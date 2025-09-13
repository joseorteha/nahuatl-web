# Documentación Técnica del Frontend - Nawatlajtol (Aplicación de Aprendizaje de Náhuatl)

## 📋 Índice
1. [Introducción](#introducción)
2. [Arquitectura y Tecnologías](#arquitectura-y-tecnologías)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Páginas Principales](#páginas-principales)
5. [Componentes](#componentes)
6. [Integración con API](#integración-con-api)
7. [Autenticación](#autenticación)
8. [Estilos y Diseño](#estilos-y-diseño)
9. [Animaciones](#animaciones)
10. [Flujos de Usuario](#flujos-de-usuario)
11. [Seguridad](#seguridad)
12. [Rendimiento](#rendimiento)
13. [Pruebas](#pruebas)
14. [Despliegue](#despliegue)
15. [Guía de Mantenimiento](#guía-de-mantenimiento)

---

## Introducción

Nawatlajtol es una aplicación web educativa diseñada para preservar, enseñar y difundir la lengua náhuatl. Esta plataforma incluye un diccionario interactivo, lecciones estructuradas y herramientas de práctica que permiten a los usuarios aprender náhuatl de manera moderna e interactiva.

**Propósito del documento**: Esta documentación técnica proporciona información detallada sobre la arquitectura, componentes, flujos y funcionalidades del frontend de la aplicación para desarrolladores, mantenedores y colaboradores del proyecto.

**Público objetivo**: Desarrolladores, contribuidores, mantenedores técnicos y administradores del sistema.

---

## Arquitectura y Tecnologías

### Framework Principal
- **Next.js 15.3.4**: Framework de React con renderizado del lado del servidor (SSR), generación estática (SSG) y enrutamiento integrado.
- **React 19.0.0**: Biblioteca JavaScript para construir interfaces de usuario.
- **TypeScript**: Superset tipado de JavaScript para desarrollo más seguro y escalable.

### Bibliotecas y Dependencias Principales

#### UI/Componentes
- **Tailwind CSS 3.4.17**: Framework de CSS utilitario para diseño responsivo.
- **Framer Motion 12.19.1**: Biblioteca para animaciones y transiciones.
- **Headless UI 2.2.4**: Componentes UI accesibles y sin estilos predefinidos.
- **Lucide React 0.523.0**: Iconos modernos y limpios.
- **React Icons 5.5.0**: Colección de iconos populares para React.

#### Integración con Backend
- **Supabase JS 2.50.1**: Cliente JavaScript para Supabase.
- **Auth Helpers NextJS 0.10.0**: Utilidades de Supabase para autenticación en Next.js.

#### Utilidades
- **Lodash.debounce 4.0.8**: Función de utilidad para limitar la frecuencia de ejecución de eventos.
- **date-fns 4.1.0**: Biblioteca de utilidades para manipulación de fechas.

### Patrones Arquitectónicos
- **Arquitectura basada en componentes**: Uso de componentes reutilizables y modulares.
- **Client-side + SSR Hybrid**: Combinación de renderizado en el servidor y cliente para optimizar el rendimiento y SEO.
- **API Routes**: Endpoints de API encapsulados dentro de la misma aplicación Next.js.
- **Layout Pattern**: Estructura de layouts anidados para mantener coherencia en la UI.

---

## Estructura del Proyecto

```
frontend/
├── public/             # Archivos estáticos
│   ├── favicon.ico
│   ├── logo.png
│   └── ... (otros assets)
├── src/
│   ├── app/            # Páginas y rutas (App Router de Next.js)
│   │   ├── layout.tsx  # Layout principal
│   │   ├── page.tsx    # Página de inicio
│   │   ├── diccionario/
│   │   ├── dashboard/
│   │   ├── login/
│   │   ├── auth/
│   │   └── ...
│   ├── components/     # Componentes reutilizables
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Quiz.tsx
│   │   └── ...
│   ├── lib/            # Utilidades y configuraciones
│   │   ├── supabaseClient.ts
│   │   └── database.types.ts
│   └── middleware.ts   # Middleware de Next.js
├── scripts/            # Scripts de utilidad
│   └── check-env.js
├── public/             # Archivos estáticos
├── .env.local.example  # Ejemplo de variables de entorno
├── next.config.ts      # Configuración de Next.js
├── tailwind.config.js  # Configuración de Tailwind CSS
├── tsconfig.json       # Configuración de TypeScript
└── package.json        # Dependencias y scripts
```

---

## Páginas Principales

### 1. Página de Inicio (`src/app/page.tsx`)

**Propósito**: Página principal que muestra la información sobre la aplicación y anima a los usuarios a registrarse.

**Características clave**:
- Hero section con animaciones de Framer Motion
- Sección de características destacadas
- Información sobre la fase beta
- Call-to-action para registro

**Componentes relacionados**:
- `LandingHeader.tsx`: Encabezado específico para la landing page
- `AnimatedBackground.tsx`: Fondo animado decorativo

**Interacciones de usuario**:
- Navegación a registro/login
- Desplazamiento a secciones de la página
- Animaciones en hover para elementos interactivos

### 2. Diccionario (`src/app/diccionario/page.tsx`)

**Propósito**: Búsqueda interactiva en el diccionario náhuatl-español.

**Características clave**:
- Barra de búsqueda con debounce para optimizar las peticiones
- Visualización de resultados con información detallada
- Funcionalidad para guardar palabras favoritas
- Visualización de ejemplos, raíces y notas culturales

**Estados clave**:
- `searchTerm`: Término de búsqueda actual
- `results`: Resultados de la búsqueda
- `isLoading`: Estado de carga
- `savedWords`: Palabras guardadas por el usuario

**Flujo de datos**:
1. Usuario ingresa texto en la búsqueda
2. Se ejecuta búsqueda con debounce (350ms)
3. Se actualiza el estado con los resultados
4. Se renderizan los resultados o mensaje de "no encontrado"

### 3. Dashboard (`src/app/dashboard/page.tsx`)

**Propósito**: Panel de control para usuarios autenticados.

**Características clave**:
- Bienvenida personalizada
- Acceso rápido a funcionalidades principales
- Información sobre el estado de la plataforma
- Métricas de progreso del usuario (en desarrollo)

**Estados clave**:
- `user`: Información del usuario actual

**Seguridad**:
- Acceso restringido a usuarios autenticados
- Datos cargados desde localStorage

### 4. Login/Registro (`src/app/login/auth-form.tsx` y `src/app/login/page.tsx`)

**Propósito**: Sistema dual para autenticación de usuarios.

**Características clave**:
- Toggle entre formularios de login y registro
- Validación de campos
- Gestión de errores
- Almacenamiento de sesión en localStorage

**Estados clave**:
- `isSignUp`: Toggle entre login y registro
- `email/password/fullName/username`: Datos del formulario
- `error/success`: Mensajes de feedback
- `isLoading`: Estado durante la autenticación

**Flujo de autenticación**:
1. Usuario completa formulario
2. Datos enviados a la API
3. Respuesta procesada y almacenada
4. Redirección al dashboard en caso de éxito

---

## Componentes

### Header (`src/components/Header.tsx`)

**Propósito**: Barra de navegación principal con gestión de sesión.

**Props**: No recibe props.

**Estados**:
- `user`: Información del usuario actual
- `isLoading`: Estado durante la carga de datos de usuario
- `mobileMenuOpen`: Control del menú móvil

**Subcomponentes**:
- `ProfileMenu`: Menú desplegable para usuarios autenticados

**Características clave**:
- Diseño responsivo con menú hamburguesa en móvil
- Menú de perfil con opciones de usuario
- Cambio dinámico según estado de autenticación
- Transiciones animadas para el menú móvil

### Footer (`src/components/Footer.tsx`)

**Propósito**: Pie de página con información y enlaces.

**Props**: No recibe props.

**Características clave**:
- Enlaces a redes sociales
- Copyright dinámico con año actual
- Diseño responsivo

### Quiz (`src/components/Quiz.tsx`)

**Propósito**: Componente para realizar cuestionarios interactivos.

**Props**:
- `leccionId`: string - Identificador de la lección asociada al quiz

**Estados**:
- `quizData`: Datos del cuestionario
- `currentQuestionIndex`: Índice de la pregunta actual
- `selectedAnswer`: Respuesta seleccionada por el usuario
- `isCorrect`: Estado de corrección de la respuesta
- `score`: Puntuación actual
- `quizFinished`: Estado de finalización del quiz
- `loading`: Estado de carga de datos

**Flujo de interacción**:
1. Carga de datos del quiz desde la API
2. Usuario selecciona respuesta
3. Verificación de respuesta correcta/incorrecta
4. Avance a siguiente pregunta o finalización

### AnimatedBackground (`src/components/AnimatedBackground.tsx`)

**Propósito**: Fondo decorativo con elementos náhuatl animados.

**Características clave**:
- Animaciones suaves con Framer Motion
- Elementos gráficos inspirados en iconografía náhuatl
- Optimizado para no afectar el rendimiento

---

## Integración con API

### Cliente de Supabase (`src/lib/supabaseClient.ts`)

**Propósito**: Configuración y exportación del cliente de Supabase.

**Características clave**:
- Inicialización con URL y clave anónima desde variables de entorno
- Validación de configuración
- Cliente único reutilizable en toda la aplicación

### Llamadas a API del Backend

La aplicación utiliza principalmente dos enfoques para llamadas a API:

1. **Llamadas Directas a Backend Externo**:
   - URL base: `https://nahuatl-web.vercel.app/api/`
   - Endpoints principales:
     - `dictionary/search`: Búsqueda en diccionario
     - `dictionary/save`: Guardar palabras favoritas
     - `login`: Autenticación de usuarios
     - `register`: Registro de nuevos usuarios

2. **Llamadas a Supabase**:
   - Autenticación y gestión de usuarios
   - Almacenamiento de datos de perfil
   - Gestión de feedback y comentarios

**Patrones de implementación**:
- Uso de `fetch` nativo con async/await
- Manejo de errores centralizado
- Debounce para optimizar búsquedas
- Estado de carga para mejorar UX

---

## Autenticación

### Flujo de Autenticación

1. **Registro de Usuario**:
   - Formulario recopila datos (nombre, email, contraseña)
   - Envío a endpoint `/api/register`
   - Creación de cuenta en backend
   - Redirección a login

2. **Inicio de Sesión**:
   - Usuario proporciona email/usuario y contraseña
   - Validación en endpoint `/api/login`
   - Almacenamiento de datos de usuario en localStorage
   - Redirección a dashboard

3. **Gestión de Sesión**:
   - Verificación de localStorage en componentes protegidos
   - Middleware para rutas protegidas
   - Actualización del estado de UI según autenticación

4. **Cierre de Sesión**:
   - Eliminación de datos de localStorage
   - Redirección a página de inicio

**Áreas de mejora** (para implementación futura):
- Reemplazar localStorage por cookies HttpOnly
- Implementar tokens JWT con renovación automática
- Añadir autenticación con proveedores sociales (Google, Facebook)

---

## Estilos y Diseño

### Sistema de Diseño

La aplicación utiliza un sistema de diseño consistente basado en Tailwind CSS con las siguientes características:

**Paleta de Colores**:
- **Primarios**: Tonos de verde esmeralda (`emerald-600`, `emerald-700`)
- **Secundarios**: Tonos ámbar (`amber-600`, `amber-700`)
- **Neutrales**: Escala de grises (`gray-50` a `gray-900`)
- **Acentos**: Azules (`blue-600`) para elementos de acción secundarios

**Tipografía**:
- **Fuente principal**: Inter (Google Fonts)
- **Jerarquía**:
  - Títulos: 2xl-5xl, font-bold, tracking-tight
  - Subtítulos: xl-2xl, font-semibold
  - Cuerpo: base-lg, font-normal/medium

**Componentes UI**:
- **Botones**: Redondeados (rounded-xl), con gradientes y efectos hover
- **Tarjetas**: Bordes suaves, sombras ligeras, hover elevado
- **Inputs**: Iconos leading, bordes redondeados, estados focus
- **Badges**: Fondos pastel con bordes sutiles

**Principios de Diseño**:
- **Bilingüismo visual**: Incorporación de elementos náhuatl y español
- **Espaciado generoso**: Uso de márgenes y padding consistentes
- **Microinteracciones**: Animaciones sutiles en elementos interactivos
- **Accesibilidad**: Contraste adecuado y elementos focusables

---

## Animaciones

### Framer Motion

La aplicación utiliza Framer Motion para crear una experiencia de usuario dinámica y atractiva.

**Tipos de Animaciones Implementadas**:

1. **Animaciones de Entrada**:
   - Staggered children para listas y grids
   - Fade-in con desplazamiento Y para secciones
   - Scale para elementos destacados

2. **Microinteracciones**:
   - Hover scale para tarjetas y botones
   - Tap feedback para elementos clickeables
   - Transiciones suaves en cambios de estado

3. **Transiciones de Página**:
   - Fade entre páginas
   - Slide para menús y drawers

**Ejemplos Clave**:
- Animación secuencial en landing page
- Animación de entrada en resultados de búsqueda
- Efectos hover en tarjetas de dashboard

**Optimizaciones**:
- Uso de `whileInView` para animaciones basadas en viewport
- `layoutId` para transiciones continuas entre estados
- Preferencia por propiedades CSS optimizadas (transform vs. position)

---

## Flujos de Usuario

### 1. Flujo de Búsqueda en Diccionario

1. Usuario navega a `/diccionario`
2. Visualiza el estado inicial con instrucciones
3. Ingresa texto en el campo de búsqueda
4. Sistema muestra indicador de carga
5. Resultados aparecen ordenados por relevancia
6. Usuario puede:
   - Expandir/colapsar resultados
   - Guardar palabras (si está autenticado)
   - Escuchar pronunciación (funcionalidad futura)
   - Ver detalles como ejemplos y notas

### 2. Flujo de Registro/Login

1. Usuario accede a través de botón "Acceder" en header o landing
2. Visualiza formulario de login por defecto
3. Puede alternar a registro si no tiene cuenta
4. Completa el formulario con validación en tiempo real
5. Sistema muestra indicador de carga durante el proceso
6. En caso de error, muestra mensaje contextual
7. En caso de éxito, redirige al dashboard

### 3. Flujo de Interacción con Dashboard

1. Usuario autenticado accede a `/dashboard`
2. Visualiza bienvenida personalizada
3. Puede navegar a diferentes secciones:
   - Diccionario
   - Lecciones (en desarrollo)
   - Comunidad
   - Perfil
4. Cada sección presenta tarjetas con información relevante
5. Sistema adapta contenido según nivel de progreso

---

## Seguridad

### Prácticas Implementadas

1. **Validación de Datos**:
   - Validación de formularios en frontend
   - Validación secundaria en backend
   - Sanitización de inputs para prevenir XSS

2. **Gestión de Sesiones**:
   - Almacenamiento seguro de credenciales
   - Cierre de sesión funcional
   - Protección de rutas privadas

### Áreas de Mejora (roadmap de seguridad)

1. **Autenticación**:
   - Implementar JWT con expiración y renovación
   - Migrar a cookies HttpOnly en lugar de localStorage
   - Añadir autenticación de dos factores

2. **Protección de Datos**:
   - Implementar CSRF tokens
   - Mejorar encriptación de datos sensibles
   - Añadir rate limiting para endpoints críticos

3. **Políticas de Contenido**:
   - Implementar Content Security Policy (CSP)
   - Configurar CORS adecuadamente
   - Añadir encabezados de seguridad HTTP

---

## Rendimiento

### Optimizaciones Implementadas

1. **Carga de Página**:
   - Código dividido por rutas (code splitting)
   - Lazy loading de componentes pesados
   - Optimización de imágenes con next/image

2. **Renderizado**:
   - Uso de memoización para cálculos costosos
   - Renderizado condicional para componentes complejos
   - Debounce para operaciones frecuentes (búsqueda)

3. **Datos**:
   - Caché de resultados de búsqueda
   - Paginación para conjuntos grandes de datos
   - Precarga de datos críticos

### Métricas de Rendimiento Objetivo

- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.5s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Input Delay (FID)**: < 100ms

---

## Pruebas

### Estrategia de Pruebas (a implementar)

1. **Pruebas Unitarias**:
   - Componentes UI aislados
   - Funciones de utilidad
   - Transformaciones de datos

2. **Pruebas de Integración**:
   - Flujos de usuario completos
   - Interacción entre componentes
   - Llamadas a API

3. **Pruebas E2E**:
   - Navegación completa
   - Formularios y validación
   - Autenticación

### Herramientas Recomendadas

- **Jest**: Para pruebas unitarias
- **React Testing Library**: Para pruebas de componentes
- **Cypress**: Para pruebas E2E
- **MSW (Mock Service Worker)**: Para mockear API

---

## Despliegue

### Configuración Actual

- **Plataforma**: Vercel
- **Dominio**: [a configurar]
- **Rama de Producción**: main
- **Variables de Entorno**:
  - `NEXT_PUBLIC_SUPABASE_URL`: URL de Supabase
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Clave anónima de Supabase
  - `NEXT_PUBLIC_API_URL`: URL del backend

### Proceso de Despliegue

1. **Pre-despliegue**:
   - Ejecución de script `check-env.js` para validar variables
   - Compilación con `next build`
   - Ejecución de pruebas (cuando se implementen)

2. **Despliegue**:
   - Integración continua con GitHub
   - Despliegue automático en push a main
   - Previews en pull requests

3. **Post-despliegue**:
   - Verificación de rutas críticas
   - Monitoreo de errores iniciales
   - Pruebas de rendimiento

---

## Guía de Mantenimiento

### Convenciones de Código

- **Naming**: camelCase para variables/funciones, PascalCase para componentes
- **Imports**: Agrupados por origen (externos, internos, estilos)
- **Componentes**: Un componente por archivo
- **Types**: Interfaces explícitas para props y estados

### Directrices para Contribuciones

1. **Nuevas Características**:
   - Crear rama desde main (`feature/nombre-caracteristica`)
   - Seguir patrones de diseño existentes
   - Documentar componentes nuevos
   - Crear pull request con descripción detallada

2. **Corrección de Bugs**:
   - Crear rama desde main (`fix/descripcion-bug`)
   - Incluir descripción del problema
   - Añadir test que reproduzca el bug (cuando sea posible)
   - Crear pull request referenciando el issue

3. **Mejoras de Rendimiento**:
   - Medir antes y después
   - Documentar cambios y mejoras
   - Evitar optimizaciones prematuras

### Recursos Adicionales

- **Documentación de Componentes**: TBD (Storybook futuro)
- **Guía de Estilo**: Implementada en Tailwind
- **Modelo de Datos**: Ver `database.types.ts`

---

## Contacto y Soporte

- **Mantenedor Principal**: José Ortega
- **Repositorio**: [GitHub - nahuatl-web](https://github.com/joseorteha/nahuatl-web)
- **Reportar Problemas**: Sección de Issues en GitHub

---

*Documentación generada el 30 de agosto de 2025*

*Última actualización: 30 de agosto de 2025*
