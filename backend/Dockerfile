# Base Alpine para produção
FROM node:20-alpine AS base

RUN apk add --no-cache libc6-compat

WORKDIR /usr/src/app

# Dependências e build (produção)
FROM base AS builder

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# Stage para testes (Debian, compatível com MongoMemoryServer)
FROM node:20-bullseye-slim AS tester

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    libcurl4 \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

ENV NODE_ENV=test

CMD ["npm", "run", "test"]

# Stage final
FROM base AS production

COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist

ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "run", "start"]
