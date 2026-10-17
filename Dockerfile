FROM node:24.11.1-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY prisma.config.ts ./
COPY prisma ./prisma
ENV DATABASE_URL=postgresql://build:build@localhost:5432/build
RUN npm ci
COPY . .
RUN npm run build

FROM node:24.11.1-alpine AS production
WORKDIR /app
ENV NODE_ENV=production PORT=3000
COPY package*.json ./
COPY prisma.config.ts ./
COPY prisma ./prisma
ENV DATABASE_URL=postgresql://build:build@localhost:5432/build
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server
COPY --from=build /app/shared ./shared
COPY --from=build /app/prisma ./prisma
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD wget -qO- http://localhost:3000/api/health || exit 1
CMD ["./docker-entrypoint.sh"]
