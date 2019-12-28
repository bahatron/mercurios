FROM node:lts-slim

RUN npm install -g pm2
RUN npm install -g autocannon
RUN npm install -g knex

WORKDIR /app

COPY . .

RUN npm ci
RUN npm run build:clean

CMD ["npm", "start"]