# Dockerfile optimizado para arquitectura linux/arm64 (Raspberry Pi 5) y linux/amd64
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Instalar dependencias del sistema mínimas
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage de Producción ligero
FROM node:20-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV TZ=Europe/Madrid

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    tzdata \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/bot ./bot

# Directorio de persistencia para Portainer
RUN mkdir -p /app/data && chown -R node:node /app

USER node

EXPOSE 3000

VOLUME ["/app/data"]

CMD ["npm", "start"]
