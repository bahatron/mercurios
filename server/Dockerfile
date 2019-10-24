FROM node:12

RUN npm install -g pm2
RUN npm install -g typescript
RUN npm install -g autocannon

RUN pm2 install typescript

WORKDIR /app

COPY . .

RUN npm install
RUN npm run build:clean

CMD ["npm", "start"]