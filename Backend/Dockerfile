FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN ls -la && echo "Contenido de src:" && ls -la src || echo "La carpeta src no existe"
EXPOSE 3001
CMD ["node", "/app/src/index.js"]