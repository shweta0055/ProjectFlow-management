FROM node:20-alpine

WORKDIR /app

ENV CI=false

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
