# frontend/Dockerfile
FROM node:18

WORKDIR /app

ENV CI=1
ENV EXPO_TARGET=web

COPY package.json ./

RUN npm install --legacy-peer-deps
RUN npm install react-dom@18.3.1 --legacy-peer-deps

COPY . .

RUN chmod +x ./start-web.sh

EXPOSE 19006

# ⚠️ Usa el shell directamente para ejecutar correctamente
CMD ["sh", "-c", "./start-web.sh"]

