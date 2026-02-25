FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --only=production

RUN npx prisma generate

COPY worker ./worker
COPY lib ./lib

ENV NODE_ENV=production

CMD ["node", "worker/index.js"]
