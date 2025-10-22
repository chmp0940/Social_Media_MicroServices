# use the offical node.js 18 image wiht alpine
# see comments in media service docker file
FROM node:18-alpine

WORKDIR /use/src/app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

EXPOSE 3000 

CMD [ "node","src/server.js"]
