# ==========================================================
# NestJS Backend Dockerfile (Multi-Stage Build)
# ==========================================================

# ─── Stage 1: Builder ───
FROM node:22-alpine AS builder
WORKDIR /app

RUN apk add --no-cache openssl

COPY package.json package-lock.json* ./
RUN npm install

COPY prisma ./prisma/
RUN npx prisma generate

COPY . .
RUN npm run build

# ─── Stage 2: Production Runner ───
FROM node:22-alpine AS runner
WORKDIR /app

RUN apk add --no-cache openssl curl

ENV NODE_ENV=production
ENV PORT=3001

# Create a non-root user and group
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

COPY package.json package-lock.json* ./
# Copy node_modules, generated client, Prisma schema, and compiled dist from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts* ./
COPY --from=builder /app/src/generated ./src/generated
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/docker-entrypoint.sh ./docker-entrypoint.sh

RUN chown -R nestjs:nodejs /app && \
    chmod +x /app/docker-entrypoint.sh

USER nestjs

EXPOSE 3001

ENTRYPOINT ["/app/docker-entrypoint.sh"]
