FROM node:lts-alpine

RUN npm install -g pm2

WORKDIR /app

COPY . .

RUN npm ci
RUN npm run build:clean

CMD ["npm", "start"]