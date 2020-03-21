FROM node:alpine

WORKDIR /app
RUN npm i -g pm2

COPY package.json package-lock.json ./
RUN npm i

CMD pm2-runtime process.yml