FROM node:22-slim AS base

# Install sharp's native dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files and local packages
COPY package.json package-lock.json ./
COPY packages/ packages/

# Install all dependencies (need devDependencies for build step)
RUN npm ci

# Copy source code
COPY client/ client/
COPY server/ server/
COPY shared/ shared/
COPY scripts/ scripts/
COPY tsconfig.json vite.config.ts postcss.config.js tailwind.config.ts components.json ./

# Build client (Vite) and server (esbuild)
RUN npm run build

# --- Production stage ---
FROM node:22-slim AS production

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/ packages/

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built artifacts from build stage
COPY --from=base /app/dist/ dist/

# Copy runtime data directories if needed
COPY data/ data/
COPY proto/ proto/

# Cloud Run sets PORT env var (default 8080)
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "--max-old-space-size=4096", "dist/index.js"]
