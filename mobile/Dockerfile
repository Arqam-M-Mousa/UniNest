FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

EXPOSE 19000 19001 19006 8081

#For development npm install with tunnel mode for QR code scanning
CMD ["sh", "-c", "npm install && npm install -g @expo/ngrok@^4.1.0 && npx expo start --tunnel"]
