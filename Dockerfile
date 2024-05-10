# Use the official Node.js 18 image as a base image
FROM node:18 as builder

WORKDIR /build

COPY package*.json ./

RUN npm install

COPY . .

COPY .env .

EXPOSE 8080

CMD [ "npm", "run","dev" ]
