FROM node:alpine

WORKDIR /app
RUN npm i -g pm2

COPY . .
RUN npm ci

CMD pm2-runtime process.yml