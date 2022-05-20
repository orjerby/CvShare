FROM node:16

WORKDIR /project/workspace/users/

COPY package*.json ./

RUN npm i

RUN npm i -g @nestjs/cli

COPY . .

#RUN npm run build

USER node

#CMD [ "node", "dist/main" ]
#CMD ["npm", "run", "start:dev"]