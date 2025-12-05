# ================================
# Build Stage
# ================================
FROM node:25-alpine AS build

WORKDIR /app

# Pass VITE_API_URL at build time
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build


# ================================
# Production Stage (NGINX)
# ================================
FROM nginx:stable-alpine AS production

# Remove default nginx static page
RUN rm -rf /usr/share/nginx/html/*

# Copy your React build output
COPY --from=build /app/dist /usr/share/nginx/html

# Add a basic SPA nginx config (important!)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
