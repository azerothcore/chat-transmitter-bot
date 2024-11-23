FROM node:22

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

ENTRYPOINT npm run migration:run && npm start
