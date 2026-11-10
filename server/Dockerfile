# base
FROM node:24-slim AS base

WORKDIR /app 

COPY package*.json ./
COPY server/package*.json ./server/

# dev
FROM base AS dev

RUN npm ci -w server 

COPY server/ ./server/

EXPOSE 3000 

#? need ENV NODE_ENV?

WORKDIR /app/server

CMD ["npm", "run", "dev"]

# builder
FROM base AS builder

RUN npm ci -w server

COPY server/ ./server/

RUN npm run build -w server

# prod
FROM node:24-slim AS prod

WORKDIR /app 

ENV NODE_ENV=production

COPY package*.json ./
COPY server/package*.json ./server/
RUN npm ci --omit=dev -w server

COPY --from=builder /app/server/dist ./server/dist

EXPOSE 3000

USER node
CMD ["node", "server/dist/index.js"]