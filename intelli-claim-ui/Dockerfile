FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY .npmrc ./
COPY yarn.lock ./

RUN yarn install

COPY . .

EXPOSE 3000

RUN yarn build

CMD ["yarn", "start"]
