FROM node:18-slim

# Install Python 3 and pip
RUN apt-get update && apt-get install -y python3 python3-pip && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy backend dependencies
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install

# Copy backend source
COPY backend/ ./

# Copy matcher source
WORKDIR /app
COPY matcher/ ./matcher/

# Back to backend to run
WORKDIR /app/backend

EXPOSE 5001

CMD ["npm", "start"]
