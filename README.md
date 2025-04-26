En el frontend, dentro de la pagina de login, en la parte donde sale la direccion de conexion al backend, se tiene que poner el ip particular de cada computadora.

Para mirar cual ip es el tuyo, (si es windows) se pone ipconfig y buscas por el que empiece por 192.--------

Tener en cuenta que expo tiene que estar descargado, esto se hace con: npm install -g expo-cli

Dentro de la carpeta Frontend, tambien se escribe:  npm install --legacy-peer-deps

Adicionalmente, una vez todos los sistemas estan funcionando (docker compose up -d), dentro de la carpeta de Frontend se pone npx expo start. Ahi el programa arrancara :)

instalar npm install @react-native-async-storage/async-storage
