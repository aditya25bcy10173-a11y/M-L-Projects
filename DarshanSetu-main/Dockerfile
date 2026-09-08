FROM node:20-slim

# Install Python 3, venv, and native C++ build tools
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy backend package dependencies and install Node packages
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Copy Python ML requirements and create virtualenv
COPY ml-engine/traffic_predictor/requirements.txt ./ml-engine/traffic_predictor/
RUN python3 -m venv ./ml-engine/venv && \
    ./ml-engine/venv/bin/pip install --no-cache-dir -r ./ml-engine/traffic_predictor/requirements.txt

# Copy source files
COPY backend ./backend
COPY ml-engine ./ml-engine

# Build Prisma Client and compile TypeScript
RUN cd backend && npx prisma generate && npm run build

EXPOSE 5000

# Push database migrations and start server
CMD ["sh", "-c", "cd backend && npx prisma db push && node dist/index.js"]