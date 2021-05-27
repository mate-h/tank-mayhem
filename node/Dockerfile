FROM mhart/alpine-node:latest as base

WORKDIR /usr/src/app
COPY package*.json .
RUN npm install
COPY . .

# Production target
FROM base as production
ENV NODE_ENV=production
RUN npm i -g pm2
CMD pm2-runtime process.yml

# Development target
FROM base as development
ENV NODE_ENV=development
RUN npm install -g nodemon
CMD ["nodemon", "./src/index.js"]
