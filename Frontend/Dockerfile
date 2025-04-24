FROM node:20-alpine

WORKDIR /app

COPY package.json ./
COPY . .


RUN npm install --legacy-peer-deps
RUN npm install react-dom@18.3.1 --legacy-peer-deps

EXPOSE 19006

CMD ["npm", "start"]
