# Proyecto Raíces de Vida

Sistema para la gestión de alertas nutricionales y casos críticos en comunidades vulnerables de Guatemala.

## Requisitos del Sistema

### Software Requerido
- Node.js v18.x o superior
- Docker Desktop (última versión)
- Git v2.30 o superior

### Para desarrollo móvil
- Expo Go app instalada en dispositivo móvil
- Editor de código (VS Code recomendado)

## Instalación

### 1. Instalar herramientas globales
```bash
npm install -g expo-cli
```

### 2. Clonar el repositorio
```bash
git clone https://github.com/Raices-de-Vida/Raices_de_Vida.git
cd Raices_de_Vida
```

### 3. Configurar Backend
```bash
cd Backend
npm install
```

### 4. Configurar Frontend
```bash
cd Frontend
npm install --legacy-peer-deps
npm install @react-native-async-storage/async-storage
npm install @react-native-community/netinfo
npx expo install expo-notifications
npx expo install expo-device
npm install @react-navigation/bottom-tabs --legacy-peer-deps
```

## Ejecución

### Iniciar Backend (Base de Datos + API)
```bash
# Desde la raíz del proyecto
docker compose up -d
```

### Iniciar Aplicación Móvil
```bash
cd Frontend
npx expo start --clear
```
Usa `--clear` para limpiar caché después de cambios en traducciones o configuración.

### Verificar funcionamiento
- Backend: http://localhost:3001
- Escanear código QR con Expo Go para acceder a la app móvil

## Configuración de Red

### Obtener IP Local

**Windows:**
```cmd
ipconfig
```
Buscar la dirección IPv4 (ejemplo: 192.168.1.100)

**macOS/Linux:**
```bash
hostname -I
```

### Actualizar IP en Frontend
Reemplazar `localhost` con tu IP local en estos archivos:
- `src/context/AuthContext.js`
- `src/screens/LoginScreen.js` 
- `src/screens/RegisterScreen.js`

Ejemplo:
```javascript
// Cambiar de:
const API_BASE_URL = 'http://localhost:3001';
// A:
const API_BASE_URL = 'http://192.168.1.100:3001';
```

## Pruebas de Seguridad

El proyecto incluye un sistema completo de pruebas automatizadas:

```bash
# Ejecutar todas las pruebas de seguridad
cd Backend
npm run test:security

# Pruebas por módulos
npm run test:security:module1  # Autenticación (38 tests)
npm run test:security:module2  # Comunicación (44 tests) 
npm run test:security:module3  # Usuarios (36 tests)
npm run test:security:module4  # Amenazas (46 tests)
```

## Solución de Problemas

### Puerto ocupado
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3001 | xargs kill
```

### Error de contenedores Docker
```bash
docker compose down
docker compose up --build -d
```

### Error de dependencias
```bash
cd Frontend
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### App no conecta al backend
1. Verificar que backend esté corriendo en puerto 3001
2. Confirmar que la IP esté actualizada en archivos de configuración
3. Asegurar que el dispositivo esté en la misma red WiFi
