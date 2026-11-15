FROM node:22-alpine
WORKDIR /app
COPY package.json ./
COPY server.js ./
COPY src ./src
COPY public ./public
USER node
EXPOSE 3000
CMD ["node","server.js"]
