# Script de Migración Automática: useAuthBackend → useAuth
# Busca y reemplaza todas las importaciones en archivos TypeScript/TSX

Write-Host "🔍 Buscando archivos que usan useAuthBackend..." -ForegroundColor Cyan

# Buscar todos los archivos que importan useAuthBackend
$files = Get-ChildItem -Path "src" -Recurse -Include "*.tsx","*.ts" | 
  Where-Object { 
    $content = Get-Content $_.FullName -Raw
    $content -match "useAuthBackend"
  }

Write-Host "📝 Encontrados $($files.Count) archivos para migrar:" -ForegroundColor Yellow
$files | ForEach-Object { Write-Host "  - $($_.FullName)" -ForegroundColor Gray }

Write-Host ""
$confirm = Read-Host "¿Deseas proceder con la migración automática? (S/N)"

if ($confirm -ne "S" -and $confirm -ne "s") {
    Write-Host "❌ Migración cancelada" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "🔄 Iniciando migración automática..." -ForegroundColor Green

$migrated = 0
$errors = 0

foreach ($file in $files) {
    try {
        Write-Host "  📄 Procesando: $($file.Name)..." -ForegroundColor Cyan
        
        $content = Get-Content $file.FullName -Raw
        $original = $content
        
        # Reemplazar import
        $content = $content -replace "import \{ useAuthBackend \} from '@/hooks/useAuthBackend';", "import { useAuth } from '@/contexts/AuthContext';"
        $content = $content -replace "import \{ useAuthBackend \} from ""@/hooks/useAuthBackend"";", "import { useAuth } from '@/contexts/AuthContext';"
        
        # Reemplazar llamadas al hook
        $content = $content -replace "useAuthBackend\(\)", "useAuth()"
        $content = $content -replace "= useAuthBackend\(", "= useAuth("
        
        # Solo escribir si hubo cambios
        if ($content -ne $original) {
            Set-Content -Path $file.FullName -Value $content -NoNewline
            Write-Host "    ✅ Migrado exitosamente" -ForegroundColor Green
            $migrated++
        } else {
            Write-Host "    ⚠️  Sin cambios necesarios" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "    ❌ Error: $_" -ForegroundColor Red
        $errors++
    }
}

Write-Host ""
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "📊 RESUMEN DE MIGRACIÓN" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "  Archivos encontrados: $($files.Count)" -ForegroundColor White
Write-Host "  Migrados exitosamente: $migrated" -ForegroundColor Green
Write-Host "  Errores: $errors" -ForegroundColor $(if ($errors -gt 0) { "Red" } else { "Green" })
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

if ($migrated -gt 0) {
    Write-Host "🎉 ¡Migración completada!" -ForegroundColor Green
    Write-Host "📋 Próximos pasos:" -ForegroundColor Cyan
    Write-Host "  1. Revisar los cambios: git diff" -ForegroundColor White
    Write-Host "  2. Compilar: npm run build" -ForegroundColor White
    Write-Host "  3. Probar: npm run dev" -ForegroundColor White
    Write-Host "  4. Verificar en DevTools que solo hay 1 petición" -ForegroundColor White
} else {
    Write-Host "⚠️  No se encontraron archivos para migrar" -ForegroundColor Yellow
}
