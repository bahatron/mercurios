FROM node:lts-alpine

COPY ./tests /app/tests
COPY ./lib /app/lib
WORKDIR /app/tests

RUN npm install -g autocannon
RUN npm ci
RUN npm run build:clean

ENV MERCURIOS_ENV=production

CMD ["npm", "start"]