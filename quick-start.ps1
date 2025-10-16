# Script de inicio rápido para pruebas
# Uso: .\quick-start.ps1

Write-Host "Sistema de Exportación PDF" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar ubicación
$projectRoot = ""
if (-not (Test-Path $projectRoot)) {
    Write-Host "Error: No se encuentra el directorio del proyecto" -ForegroundColor Red
    Write-Host "   Ubicación esperada: $projectRoot" -ForegroundColor Yellow
    exit 1
}

Set-Location $projectRoot

# Verificar PDF plantilla
Write-Host "Verificando PDF plantilla..." -ForegroundColor Yellow
if (Test-Path ".\Patient Consult Summary.pdf") {
    Write-Host "   PDF plantilla encontrado" -ForegroundColor Green
} else {
    Write-Host "   ERROR: No se encuentra 'Patient Consult Summary.pdf'" -ForegroundColor Red
    Write-Host "   Debes colocar el archivo en la raíz del proyecto" -ForegroundColor Yellow
    exit 1
}

# Menú de opciones
Write-Host ""
Write-Host "Selecciona una opción:" -ForegroundColor Cyan
Write-Host "1. Iniciar Backend + Frontend (Desarrollo Local)" -ForegroundColor White
Write-Host "2. Iniciar con Docker" -ForegroundColor White
Write-Host "3. Probar generación de PDF (solo Backend)" -ForegroundColor White
Write-Host "4. Ver logs de Docker" -ForegroundColor White
Write-Host "5. Detener todos los servicios" -ForegroundColor White
Write-Host "6. Salir" -ForegroundColor White
Write-Host ""

$opcion = Read-Host "Opción"

switch ($opcion) {
    "1" {
        Write-Host ""
        Write-Host "Iniciando Backend + Frontend..." -ForegroundColor Green
        Write-Host ""
        Write-Host "INSTRUCCIONES:" -ForegroundColor Yellow
        Write-Host "   1. Se abrirán 2 ventanas de PowerShell" -ForegroundColor White
        Write-Host "   2. Terminal 1: Backend (puerto 3000)" -ForegroundColor White
        Write-Host "   3. Terminal 2: Frontend (Expo)" -ForegroundColor White
        Write-Host "   4. Escanea el QR con Expo Go en tu teléfono" -ForegroundColor White
        Write-Host ""
        
        # Iniciar Backend en nueva ventana
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\Backend'; Write-Host '🔧 BACKEND' -ForegroundColor Cyan; npm run dev"
        
        Start-Sleep -Seconds 2
        
        # Iniciar Frontend en nueva ventana
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\Frontend'; Write-Host '📱 FRONTEND' -ForegroundColor Cyan; npx expo start"
        
        Write-Host "✅ Servicios iniciados en ventanas separadas" -ForegroundColor Green
    }
    
    "2" {
        Write-Host ""
        Write-Host "🐳 Iniciando con Docker..." -ForegroundColor Green
        docker-compose up
    }
    
    "3" {
        Write-Host ""
        Write-Host "🧪 Probando generación de PDF..." -ForegroundColor Green
        Set-Location "$projectRoot\Backend"
        
        # Verificar que node_modules existe
        if (-not (Test-Path ".\node_modules")) {
            Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
            npm install
        }
        
        # Ejecutar script de prueba
        node test-pdf.js
        
        Write-Host ""
        Write-Host "📂 Abriendo directorio de exports..." -ForegroundColor Yellow
        $exportsDir = ".\exports"
        if (Test-Path $exportsDir) {
            Invoke-Item $exportsDir
        } else {
            Write-Host "   ⚠️  Directorio exports no existe aún" -ForegroundColor Yellow
        }
    }
    
    "4" {
        Write-Host ""
        Write-Host "📋 Logs de Docker..." -ForegroundColor Green
        docker-compose logs -f
    }
    
    "5" {
        Write-Host ""
        Write-Host "🛑 Deteniendo servicios..." -ForegroundColor Red
        docker-compose down
        Write-Host "✅ Servicios detenidos" -ForegroundColor Green
    }
    
    "6" {
        Write-Host ""
        Write-Host "👋 ¡Hasta luego!" -ForegroundColor Cyan
        exit 0
    }
    
    default {
        Write-Host ""
        Write-Host "❌ Opción inválida" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Presiona Enter para continuar..."
Read-Host
