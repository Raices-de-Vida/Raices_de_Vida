# Raíces de Vida - Backend

## Prerrequisitos
- Node.js v16+
- PostgreSQL v13+
- Docker (opcional)
- Postman (para pruebas)

---

## Instalación

### 1. Clonar el Repositorio
git clone https://github.com/bar23354/Ra-ces-de-Vida.git
cd Ra-ces-de-Vida/backend

### 2. Construir la imagen Docker
docker build -t raices-backend .
docker run -p 3000:3000 --env-file .env raices-backend

### 3. otros comando útiles
# Detener contenedor en ejecución
docker stop $(docker ps -q --filter ancestor=raices-backend)

# Eliminar contenedor detenido
docker rm $(docker ps -aq --filter ancestor=raices-backend)

# Eliminar imagen
docker rmi raices-backend
# Levantar todos los servicios (app + PostgreSQL)
docker-compose up --build

# Detener y eliminar contenedores
docker-compose down

# Eliminar volúmenes persistentes
docker-compose down -v