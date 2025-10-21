# Contributing Guidelines - Nawatlahtol

## 🚫 **IMPORTANT: This is a private project**

This repository is **private and personal**. External contributions are not accepted.

## 📋 **For Authorized Developers**

If you are part of the authorized development team, follow these guidelines:

### 🔧 **Environment Setup**

```bash
# Clone the repository
git clone https://github.com/joseorteha/nahuatl-web.git
cd nahuatl-web

# Install dependencies
npm run setup

# Run in development mode
npm run dev
```

### 📁 **Project Structure**

```
nahuatl-web/
├── frontend/          # Next.js Application
├── backend/           # Express.js API
├── docs/             # Documentation
├── scripts/           # Utility scripts
├── data/             # Shared data
└── config/           # Configurations
```

### 🎯 **Code Standards**

- **Frontend**: TypeScript, React, Next.js, Tailwind CSS
- **Backend**: Node.js, Express.js, PostgreSQL
- **Database**: Supabase
- **Authentication**: Google OAuth

### 📝 **Development Process**

1. **Create branch**: `git checkout -b feature/feature-name`
2. **Develop**: Implement changes
3. **Test**: `npm run test`
4. **Commit**: Descriptive messages in Spanish
5. **Push**: `git push origin feature/feature-name`
6. **Merge**: Only the owner can merge

### 🚨 **Important Rules**

- ❌ **DO NOT** push directly to `main`
- ❌ **DO NOT** share credentials
- ❌ **DO NOT** modify production configurations
- ✅ **YES** follow the folder structure
- ✅ **YES** document important changes
- ✅ **YES** test before commit

### 📞 **Contact**

For questions or issues, contact the repository owner directly.

---

**© 2025 José Ortega - All rights reserved**
