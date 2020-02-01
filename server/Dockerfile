FROM node:lts-alpine

RUN npm install -g pm2

WORKDIR /app
COPY . .

RUN npm ci
RUN npm run build:clean

EXPOSE 3000

ENV MERCURIOS_ENV=production

CMD ["npm", "start"]