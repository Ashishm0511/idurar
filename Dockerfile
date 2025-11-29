### Stage 1: Build frontend ###
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps

COPY frontend/ ./
RUN npm run build   # Vite -> output = dist/


### Stage 2: Setup backend & serve frontend ###
FROM node:20-alpine AS backend

WORKDIR /app

# Copy backend package and install deps
COPY backend/package*.json ./backend/
RUN cd backend && npm install --legacy-peer-deps

# Copy backend source
COPY backend/ ./backend/

# Copy built frontend into backend public folder
COPY --from=frontend-build /app/frontend/dist ./backend/public

EXPOSE 5000

CMD ["node", "backend/server.js"]  
