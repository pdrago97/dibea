# Backend Dockerfile - Multi-stage for production optimization
FROM node:18-alpine AS base

# Install dependencies for production
FROM base AS deps
RUN apk add --no-cache curl netcat-openbsd
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install only production dependencies
RUN npm install --omit=dev && npm cache clean --force

# Build stage
FROM base AS builder
WORKDIR /app

# Copy package files and install all dependencies for build
COPY package*.json ./
COPY tsconfig.json ./
RUN npm ci

# Copy source code
COPY src/ ./src/
COPY prisma/ ./prisma/

# Generate Prisma client with OpenSSL 3.0
ENV PRISMA_CLI_BINARY_TARGETS=linux-musl-openssl-3.0.x
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Production stage
FROM base AS runner
RUN apk add --no-cache curl netcat-openbsd openssl openssl-dev

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

WORKDIR /app

# Copy built application
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Create necessary directories
RUN mkdir -p logs uploads && chown -R nodejs:nodejs logs uploads

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start script
COPY --from=builder /usr/local/bin/docker-entrypoint.sh /usr/local/bin/
USER root
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
USER nodejs

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "dist/index.js"]
