# Raíces de Vida - Backend

API REST para la gestión de alertas nutricionales y casos críticos.

## Requisitos
- Node.js v18 o superior
- Docker Desktop
- PostgreSQL 13+ (si no usa Docker)

## Instalación

### Con Docker (Recomendado)
```bash
# Desde la raíz del proyecto
docker compose up -d
```

### Sin Docker
```bash
cd Backend
npm install
# Configurar PostgreSQL local
npm start
```

## Configuración

El archivo `.env` ya está configurado con:
```env
JWT_SECRET=raices_de_vida_secret_key
DB_HOST=db
DB_USER=user
DB_PASSWORD=password
DB_NAME=Proyecto1
PORT=3001
```

## API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `GET /api/auth/verify` - Verificar token

### Alertas
- `GET /api/alertas` - Listar alertas
- `POST /api/alertas` - Crear alerta
- `PUT /api/alertas/:id` - Actualizar alerta
- `DELETE /api/alertas/:id` - Eliminar alerta

### Casos Críticos
- `GET /api/casos` - Listar casos
- `POST /api/casos` - Crear caso
- `PUT /api/casos/:id` - Actualizar caso

### Información de Usuario
- `GET /api/user-info/profile` - Obtener perfil
- `PUT /api/user-info/profile` - Actualizar perfil

## Pruebas de Seguridad

El backend incluye 164+ pruebas automatizadas de seguridad:

```bash
# Ejecutar todas las pruebas
npm run test:security

# Por módulos específicos
npm run test:security:module1    # Autenticación (38 tests)
npm run test:security:module2    # Comunicación (44 tests)
npm run test:security:module3    # Usuarios (36 tests)
npm run test:security:module4    # Amenazas (46 tests)

# Modo watch
npm run test:security:watch
```

### Cobertura de Seguridad
- SQL Injection Protection
- XSS Prevention
- Rate Limiting
- JWT Security
- Password Security
- Input Validation
- SSL/TLS Configuration
- Session Management
- Threat Detection

## Base de Datos

### Acceso a PostgreSQL
```bash
# Con Docker
docker exec -it raices_db psql -U user -d Proyecto1

# Comandos útiles
\dt                    # Listar tablas
\d Users              # Describir tabla
SELECT * FROM Users;  # Consultar datos
```

## Scripts Disponibles

```bash
npm start              # Iniciar servidor
npm run dev           # Modo desarrollo
npm test              # Pruebas unitarias
npm run test:security # Pruebas de seguridad
```

## Comandos Docker

```bash
# Ver logs
docker logs raices_backend -f

# Reiniciar servicios
docker compose restart

# Eliminar contenedores
docker compose down

# Eliminar volúmenes (CUIDADO: borra datos)
docker compose down -v
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

### Error de base de datos
```bash
docker compose restart db
docker logs raices_db
```

### Reinstalar dependencias
```bash
rm -rf node_modules package-lock.json
npm install
```