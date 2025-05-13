# Sprint 2: Proyecto Raíces de Vida

Instalación Completa
## 1. Instalar dependencias globales
npm install -g expo-cli

## 2. Clonar repositorio (incluyendo submódulos)
git clone --recurse-submodules https://github.com/bar23354/Ra-ces-de-Vida.git
cd Ra-ces-de-Vida/sprint2/Frontend

## 3. Instalar paquetes (con compatibilidad legacy) dentro de la carpeta del Frontend
cd Frontend
npm install --legacy-peer-deps
npm install @react-native-async-storage/async-storage
npm install @react-native-community/netinfo


## 4. Iniciar backend en Docker
docker compose up -d

## 5. Iniciar aplicación móvil
cd Frontend
npx expo start

# ¡ATENCIÓN!
Dentro del proyecto, hay diveras pantallas en el frontend en donde se debe de colocar la IP (por ejemplo, la pantalla del log-in). Para obtener tu IP y colocarla en todos estos diferentes archivos debes de seguir los siguieentes pasos:

### Obtener tu IP Local (Windows)
1. Abre CMD y ejecuta:
   ```cmd
   ipconfig
   Usa el numero que sale en IPv4
