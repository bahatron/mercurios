FROM node:lts-alpine
WORKDIR /app
COPY . .

RUN npm install -g pm2
RUN npm ci
RUN npm run build:clean

ENV MERCURIOS_ENV=production

CMD ["npm", "start"]