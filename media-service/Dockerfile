# use the offical node.js 18 image wiht alpine

# An Alpine image is a very small, lightweight version of a Linux operating system called Alpine Linux — often used as a base image in Docker.

# This means your container is using Node.js version 18, but on top of a minimal Alpine Linux OS instead of a full-size Ubuntu or Debian system.

FROM node:18-alpine

# A Docker image is a read-only template that contains your application code, runtime, libraries, environment variables, and configuration files.
# Built from a Dockerfile.
# Example: node:18-alpine is an official Node.js image.

WORKDIR /use/src/app   
# set working directory

COPY package*.json ./
# copy dependency files

RUN npm ci --only=production
# install dependency

COPY . .
# copy source code

EXPOSE 3003

CMD [ "node","src/server.js"]
# run app

# 2. Container
# A container is a runtime instance of an image.
# It is isolated from the host system and other containers.
# You can start, stop, and remove containers independently.
