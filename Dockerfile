FROM docker.arvancloud.ir/node:20

WORKDIR /src/app

COPY package.json ./
COPY yarn.lock ./

RUN yarn install

COPY . .

EXPOSE 3012

CMD ["yarn", "start"]
