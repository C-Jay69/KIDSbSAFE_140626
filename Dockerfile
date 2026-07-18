# syntax=docker/dockerfile:1

# ---- Build stage ----
FROM oven/bun:1 AS build
WORKDIR /app

# Root workspace manifests (bun workspace + lockfile)
COPY package.json bun.lock turbo.json tsconfig.json ./
# Web package source + its own tsconfig files
COPY packages/web ./packages/web

# Install only the web workspace deps (avoids pulling Expo/mobile)
WORKDIR /app/packages/web
RUN bun install

# Build the SPA into packages/web/dist
RUN bun run build

# ---- Runtime stage ----
FROM oven/bun:1 AS run
WORKDIR /app/packages/web

ENV NODE_ENV=production
ENV PORT=3000

# Runtime needs: built SPA, deps, and the TS server source (Bun runs .ts directly)
COPY --from=build /app/packages/web/dist ./dist
COPY --from=build /app/packages/web/node_modules ./node_modules
COPY --from=build /app/packages/web/src ./src
COPY --from=build /app/packages/web/package.json ./package.json

EXPOSE 3000
CMD ["bun", "src/api/server.ts"]
