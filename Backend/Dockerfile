FROM node:20-alpine
WORKDIR /app
COPY Backend/package*.json ./
RUN npm install
COPY Backend/ ./
RUN ls -la && ls -la src || (echo "El directorio src no existe" && exit 1)
EXPOSE 3001
CMD ["npm", "start"]