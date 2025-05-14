FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN ls -la && ls -la src || (echo "El directorio src no existe" && exit 1)
EXPOSE 3001
CMD ["npm", "start"]