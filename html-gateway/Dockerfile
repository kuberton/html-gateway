FROM node:10-alpine
WORKDIR /app
RUN npm config set color false
COPY package*.json ./
RUN npm install -s
COPY . .

EXPOSE 3000

CMD ["node", "server.js"]