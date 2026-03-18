FROM node:20-bookworm-slim
WORKDIR /app

# wget install karo healthcheck ke liye
RUN apt-get update -y && apt-get install -y wget openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY prisma ./prisma
RUN npx prisma generate
COPY src ./src
ENV NODE_ENV=production
EXPOSE 4000
CMD ["sh", "-c", "npx prisma migrate deploy && node src/index.js"]