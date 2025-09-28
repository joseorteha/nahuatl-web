# Guía de Contribución - Nawatlahtol

## 🚫 **IMPORTANTE: Este es un proyecto privado**

Este repositorio es **privado y personal**. No se aceptan contribuciones externas.

## 📋 **Para Desarrolladores Autorizados**

Si eres parte del equipo de desarrollo autorizado, sigue estas pautas:

### 🔧 **Configuración del Entorno**

```bash
# Clonar el repositorio
git clone https://github.com/joseorteha/nahuatl-web.git
cd nahuatl-web

# Instalar dependencias
npm run setup

# Ejecutar en modo desarrollo
npm run dev
```

### 📁 **Estructura del Proyecto**

```
nahuatl-web/
├── frontend/          # Aplicación Next.js
├── backend/           # API Express.js
├── docs/             # Documentación
├── scripts/           # Scripts de utilidad
├── data/             # Datos compartidos
└── config/           # Configuraciones
```

### 🎯 **Estándares de Código**

- **Frontend**: TypeScript, React, Next.js, Tailwind CSS
- **Backend**: Node.js, Express.js, PostgreSQL
- **Base de datos**: Supabase
- **Autenticación**: Google OAuth

### 📝 **Proceso de Desarrollo**

1. **Crear rama**: `git checkout -b feature/nombre-feature`
2. **Desarrollar**: Implementar cambios
3. **Probar**: `npm run test`
4. **Commit**: Mensajes descriptivos en español
5. **Push**: `git push origin feature/nombre-feature`
6. **Merge**: Solo el propietario puede hacer merge

### 🚨 **Reglas Importantes**

- ❌ **NO** hacer push directo a `main`
- ❌ **NO** compartir credenciales
- ❌ **NO** modificar configuraciones de producción
- ✅ **SÍ** seguir la estructura de carpetas
- ✅ **SÍ** documentar cambios importantes
- ✅ **SÍ** probar antes de commit

### 📞 **Contacto**

Para dudas o problemas, contactar directamente al propietario del repositorio.

---

**© 2025 José Ortega - Todos los derechos reservados**
