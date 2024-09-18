FROM docker.arvancloud.ir/node:20-slim

WORKDIR /src/app

COPY package.json ./
COPY yarn.lock ./

RUN yarn install

COPY . .

EXPOSE 3000

CMD ["yarn", "start"]
