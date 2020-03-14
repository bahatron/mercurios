FROM node:lts-alpine
WORKDIR /app
COPY ./tests .

RUN npm install -g autocannon
RUN npm ci
RUN npm run build:clean

ENV MERCURIOS_ENV=production

CMD ["npm", "start"]