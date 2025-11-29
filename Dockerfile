### Stage 1: Build frontend ###
FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps

COPY frontend/ ./
RUN npm run build   # or the correct build command for frontend

### Stage 2: Setup backend + serve frontend ###
FROM node:18-alpine AS backend

WORKDIR /app

# Copy backend code
COPY backend/package*.json ./backend/
RUN cd backend && npm install --legacy-peer-deps

COPY --from=frontend-build /app/frontend/build ./backend/public   # adjust target path accordingly

COPY backend/ ./backend/

EXPOSE 5000

CMD ["node", "backend/server.js"]   
