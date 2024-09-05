<<<<<<< HEAD
FROM node:20-alpine

WORKDIR /src/app

COPY package.json ./
COPY yarn.lock ./

RUN yarn install

COPY . .

EXPOSE 3000

CMD ["yarn", "start"]
=======
FROM node:20-alpine

WORKDIR /src/app

COPY package.json ./
COPY yarn.lock ./

RUN yarn install

COPY . .

EXPOSE 3000

CMD ["yarn", "start"]

>>>>>>> 65ab01f (dockerfile)
