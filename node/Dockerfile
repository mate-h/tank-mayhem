FROM mhart/alpine-node:latest as base

WORKDIR /usr/src/app
COPY package*.json .
RUN npm install
COPY . .

# Production target
FROM base as production
ENV NODE_ENV=production
RUN npm ci
RUN npm i -g pm2
CMD ["npm", "run", "start:prod"]

# Development target
FROM base as development
ENV NODE_ENV=development
RUN npm i -g nodemon
CMD ["npm", "run", "dev"]
