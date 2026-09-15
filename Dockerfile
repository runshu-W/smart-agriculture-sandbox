ARG NODE_IMAGE=node:24-bookworm-slim
FROM ${NODE_IMAGE} AS base
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates openssl \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS dependencies
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM dependencies AS builder
COPY . .
# Placeholder used only by the build; no production credentials enter the image.
RUN DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build npm run db:generate \
    && DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build npm run build

FROM base AS runner
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public
USER node
EXPOSE 3000
HEALTHCHECK --interval=20s --timeout=5s --start-period=30s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:3000/api/health',{signal:AbortSignal.timeout(4000)}).then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]

# Operational image for migrations / explicit first-time initialization only.
FROM dependencies AS tools
ENV NODE_ENV=production
COPY prisma ./prisma
COPY prisma.config.ts tsconfig.json ./
COPY lib ./lib
COPY deploy/init-empty.mjs ./deploy/init-empty.mjs
RUN DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build npm run db:generate
USER node
CMD ["npm", "run", "db:deploy"]
