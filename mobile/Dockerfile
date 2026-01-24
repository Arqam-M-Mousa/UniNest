FROM node:20-alpine

WORKDIR /app

# Install system deps needed by Expo
RUN apk add --no-cache bash git libc6-compat

# Copy dependency files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy app source
COPY . .

# Expo / Metro / Web
EXPOSE 19000 19001 19002 19006 8081

# Required so Expo is reachable outside container
ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0

# Start Expo in LAN mode (NOT tunnel)
CMD ["npx", "expo", "start", "--lan"]
