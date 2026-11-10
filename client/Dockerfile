# base: workspace manifests + all deps (vite, tsc are devDeps, needed by dev and builder)
FROM node:24-slim AS base
WORKDIR /app
COPY package*.json ./
COPY client/package*.json ./client/
RUN npm ci -w client

# dev: vite dev server with HMR; --host so it listens on 0.0.0.0, not the container's loopback
FROM base AS dev
COPY client/ ./client/
WORKDIR /app/client
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]

# builder: type-check + bundle into static files at /app/client/dist
FROM base AS builder
COPY client/ ./client/
RUN npm run build -w client

# prod: no Node at all, nginx serves the static files and proxies /api to the server
FROM nginx:1.28-alpine AS prod
COPY client/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/client/dist /usr/share/nginx/html
EXPOSE 80
