# Script de inicio - Raices de Vida
# Requiere archivo .env en la raiz del proyecto

param(
    [switch]$Local,
    [switch]$Cloud,
    [switch]$Help
)

$ErrorActionPreference = "Stop"

function Show-Help {
    Write-Host "Uso: .\start.ps1 [-Local | -Cloud] [-Help]"
    Write-Host ""
    Write-Host "Opciones:"
    Write-Host "  -Local    Usar base de datos local (Docker)"
    Write-Host "  -Cloud    Usar base de datos en la nube (Aiven)"
    Write-Host "  -Help     Mostrar esta ayuda"
    Write-Host ""
    Write-Host "Ejemplos:"
    Write-Host "  .\start.ps1 -Local"
    Write-Host "  .\start.ps1 -Cloud"
    exit 0
}

function Test-EnvFile {
    if (-not (Test-Path ".\.env")) {
        Write-Host "ERROR: No se encuentra el archivo .env" -ForegroundColor Red
        Write-Host ""
        Write-Host "El archivo .env es requerido para ejecutar la aplicacion." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "El archivo .env debe contener:" -ForegroundColor Cyan
        Write-Host "  - JWT_SECRET" -ForegroundColor White
        Write-Host "  - DATABASE_URL o DB_HOST/DB_USER/DB_PASSWORD/DB_NAME" -ForegroundColor White
        Write-Host ""
        exit 1
    }
}

function Start-LocalMode {
    Write-Host "Modo: Base de datos LOCAL (Docker)" -ForegroundColor Cyan
    Write-Host ""
    
    try {
        docker --version | Out-Null
    } catch {
        Write-Host "ERROR: Docker no esta instalado o no esta corriendo" -ForegroundColor Red
        exit 1
    }
    
    if (-not (Test-Path ".\Backend\.env.local")) {
        Write-Host "ERROR: No se encuentra Backend\.env.local" -ForegroundColor Red
        Write-Host "Este archivo es necesario para el modo local." -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "Iniciando contenedores Docker..." -ForegroundColor Yellow
    docker-compose -f docker-compose.yml up -d
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: No se pudieron iniciar los contenedores" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Esperando a que la base de datos este lista..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    $env:NODE_ENV = "development"
    
    Write-Host ""
    Write-Host "Entorno LOCAL iniciado correctamente" -ForegroundColor Green
    Write-Host ""
    Write-Host "Backend: http://localhost:3001" -ForegroundColor Green
    Write-Host "Base de datos: localhost:5432" -ForegroundColor Green
    Write-Host "Database: Proyecto1" -ForegroundColor Green
    Write-Host ""
    Write-Host "Para inicializar datos de prueba, ejecuta:" -ForegroundColor Yellow
    Write-Host "  Invoke-WebRequest -Method POST -Uri http://localhost:3001/api/dev/seed" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Para ver logs:" -ForegroundColor Yellow
    Write-Host "  docker logs raices_backend -f" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "Iniciando Frontend..." -ForegroundColor Yellow
    Set-Location ".\Frontend"
    Write-Host "Limpiando cache de Metro bundler..." -ForegroundColor Yellow
    npx expo start --clear
}

function Start-CloudMode {
    Write-Host "Modo: Base de datos CLOUD (Aiven)" -ForegroundColor Cyan
    Write-Host ""
    
    $envContent = Get-Content ".\.env" -Raw
    if ($envContent -notmatch "DATABASE_URL") {
        Write-Host "ERROR: .env no contiene DATABASE_URL" -ForegroundColor Red
        Write-Host "El modo cloud requiere DATABASE_URL configurado." -ForegroundColor Yellow
        exit 1
    }
    
    $env:NODE_ENV = "production"
    
    Write-Host "Iniciando Backend con base de datos cloud..." -ForegroundColor Yellow
    docker-compose -f docker-compose.cloud.yml up -d
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: No se pudo iniciar el contenedor" -ForegroundColor Red
        exit 1
    }
    
    Start-Sleep -Seconds 5
    
    Write-Host ""
    Write-Host "Entorno CLOUD iniciado correctamente" -ForegroundColor Green
    Write-Host ""
    Write-Host "Backend: http://localhost:3001" -ForegroundColor Green
    Write-Host "Base de datos: Aiven Cloud" -ForegroundColor Green
    Write-Host ""
    Write-Host "Para ver logs:" -ForegroundColor Yellow
    Write-Host "  docker logs raices_backend -f" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "Iniciando Frontend..." -ForegroundColor Yellow
    Set-Location ".\Frontend"
    npx expo start
}

if ($Help) {
    Show-Help
}

Test-EnvFile

if (-not $Local -and -not $Cloud) {
    Write-Host "ERROR: Debes especificar -Local o -Cloud" -ForegroundColor Red
    Write-Host ""
    Show-Help
}

if ($Local -and $Cloud) {
    Write-Host "ERROR: No puedes usar -Local y -Cloud al mismo tiempo" -ForegroundColor Red
    exit 1
}

if ($Local) {
    Start-LocalMode
} elseif ($Cloud) {
    Start-CloudMode
}
