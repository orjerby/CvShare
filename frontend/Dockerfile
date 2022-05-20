FROM node:16

WORKDIR /project/workspace/frontend/

COPY package*.json ./

RUN npm i

RUN npm i -g expo-cli

COPY . .

USER node

#CMD [ "npm", "start" ]