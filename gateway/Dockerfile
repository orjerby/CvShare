FROM node:16

RUN npm i -g @nestjs/cli

#RUN addgroup orjerby
#RUN adduser orjerby
#RUN useradd -ms /bin/bash orjerby
#USER orjerby

WORKDIR /project/workspace/gateway/

COPY package*.json ./

RUN npm i

COPY . .

#RUN npm run build

USER node

#CMD [ "node", "dist/main" ]
#CMD ["npm", "run", "start:dev"]