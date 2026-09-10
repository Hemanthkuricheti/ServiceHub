# Build stage - Vite reads frontend/.env at build time (VITE_* values are
# baked into the static bundle, same as running `npm run build` locally).
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Serve stage - a tiny static server with SPA fallback so client-side
# routes (e.g. /dashboard/services) work on a hard refresh.
FROM nginx:1.27-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
