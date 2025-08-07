# Raíces de Vida - Frontend

Aplicación móvil React Native para la gestión de alertas nutricionales.

## Requisitos

### Dispositivos
- Android 6.0+ (API 23)
- iOS 12.0+
- Expo Go app instalada

### Software
- Node.js v18+
- Expo CLI
- React Native 0.76.x
- Expo SDK 52.x

## Instalación

```bash
# Instalar Expo CLI
npm install -g expo-cli

# Navegar al directorio Frontend
cd Frontend

# Instalar dependencias
npm install --legacy-peer-deps
npm install @react-native-async-storage/async-storage
npm install @react-native-community/netinfo
npx expo install expo-notifications
npx expo install expo-device
npm install @react-navigation/bottom-tabs --legacy-peer-deps
```

## Configuración

### Configurar IP del Backend

1. Obtener IP local:
```bash
# Windows
ipconfig

# macOS/Linux  
hostname -I
```

2. Actualizar archivos con tu IP local:
- `src/context/AuthContext.js`
- `src/screens/LoginScreen.js`
- `src/screens/RegisterScreen.js`

```javascript
// Cambiar de:
const API_BASE_URL = 'http://localhost:3001';
// A:
const API_BASE_URL = 'http://TU_IP_LOCAL:3001';
```

## Ejecución

```bash
# Iniciar servidor de desarrollo
npx expo start

# Opciones adicionales
npx expo start --tunnel    # Para dispositivos fuera de red
npx expo start --clear     # Limpiar caché
npx expo start --android   # Emulador Android
npx expo start --ios       # Simulador iOS
```

### En dispositivo móvil
1. Instalar Expo Go desde la tienda de aplicaciones
2. Escanear código QR
3. La app se cargará automáticamente

## Funcionalidades

### Autenticación
- Registro de usuarios (ONG/Voluntario)
- Inicio de sesión
- Persistencia de sesión

### Gestión de Alertas
- Crear alertas nutricionales
- Visualizar por departamento
- Editar alertas existentes
- Cambiar estados (Pendiente/Atendido/Derivado)
- Mapa interactivo de Guatemala

### Funcionalidades Offline
- Almacenamiento local
- Sincronización automática
- Indicador de conectividad
- Cola de sincronización

### Configuraciones
- Tema claro/oscuro
- Perfil de usuario editable
- Gestión de sesión

## Estructura del Proyecto

```
Frontend/
├── App.js                   # Punto de entrada
├── src/
│   ├── components/          # Componentes reutilizables
│   ├── context/             # Context API
│   │   ├── AuthContext.js   # Autenticación
│   │   ├── OfflineContext.js # Conectividad
│   │   └── ThemeContext.js  # Temas
│   ├── navigation/          # Navegación
│   ├── screens/             # Pantallas
│   ├── services/            # Servicios (API, Offline)
│   └── styles/              # Estilos y temas
└── assets/                  # Recursos estáticos
```

## Scripts Disponibles

```bash
npm start              # Iniciar servidor Expo
npm run android       # Ejecutar en Android
npm run ios          # Ejecutar en iOS
npm run web          # Ejecutar en web
npm test             # Ejecutar pruebas
```

## Testing

```bash
# Ejecutar pruebas
npm test

# Pruebas en modo watch
npm run test:watch

# Cobertura
npm run test:coverage
```

## Solución de Problemas

### Error de Metro Bundle
```bash
npx expo start --clear
```

### No conecta al servidor
1. Verificar backend en http://localhost:3001
2. Confirmar IP actualizada en archivos
3. Verificar misma red WiFi

### Expo CLI no reconocido
```bash
npm uninstall -g expo-cli
npm install -g @expo/cli
```

### Problemas de dependencias
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Performance lenta
Verificar que Hermes esté habilitado en `app.json`:
```json
{
  "expo": {
    "jsEngine": "hermes"
  }
}
```
