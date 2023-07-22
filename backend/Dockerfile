FROM node:latest

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install -g prisma

RUN npm install

COPY ./prisma ./prisma

RUN npx prisma generate

COPY . .

CMD ["npm", "run", "start:dev"]