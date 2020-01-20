FROM node:lts-slim

RUN npm install -g pm2
RUN npm install -g autocannon

WORKDIR /app

COPY ./server .

RUN npm ci
RUN npm run build:clean

CMD ["npm", "run", "start:docker"]