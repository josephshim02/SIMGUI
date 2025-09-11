# Multi-stage build to reduce final image size
FROM node:22.9.0-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with reduced memory usage
RUN npm ci --max-old-space-size=1024

# Copy source code
COPY . .

# Build with memory limit
RUN NODE_OPTIONS="--max-old-space-size=1024" npm run build

# Production stage
FROM node:22.9.0-alpine

WORKDIR /app

# Install serve to run the static files
RUN npm install -g serve

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 5173

# Serve the application
CMD ["serve", "-s", "dist", "-l", "5173"]