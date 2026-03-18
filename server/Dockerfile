FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npm run db:generate

COPY src ./src

EXPOSE 4000
CMD ["sh", "-c", "npm run db:deploy && npm run start"]
