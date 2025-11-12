# Raices de Vida

Sistema para la gestion de alertas nutricionales y casos criticos en comunidades vulnerables de Guatemala.

## Requisitos

- Node.js v18.x o superior
- Docker Desktop (para modo local)
- Archivo .env con credenciales (contactar al administrador)

## Configuracion Inicial

### 1. Obtener credenciales

El proyecto requiere un archivo `.env` en la raiz con las credenciales de la base de datos.

### 2. Instalar dependencias globales

```powershell
npm install -g expo-cli
```

### 3. Instalar dependencias del proyecto

```powershell
cd Backend
npm install

cd ..\Frontend
npm install
```

## Ejecutar la Aplicacion

### Modo Cloud

Usa la base de datos en Aiven Cloud:

```powershell
.\start.ps1 -Cloud
```

### Modo Local

Usa Docker con PostgreSQL local:
```powershell
.\start.ps1 -Local
```

Este modo requiere:
- Docker Desktop corriendo
- Archivo `Backend\.env.local` configurado


## Pruebas

### Backend

```powershell
cd Backend

# Todos los tests
npm test

# Tests de seguridad
npm run test:security

# Coverage
npm run test:coverage
```