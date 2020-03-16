FROM node:lts-alpine
WORKDIR /app
COPY ./lib .

RUN npm install -g typescript ts-node
RUN npm ci