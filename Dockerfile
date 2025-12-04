# Dockerfile
FROM node:18-alpine

# Install mysql-client and gzip for database backup functionality
RUN apk add --no-cache mysql-client gzip

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production=false

# Copy application code
COPY . .

# Create uploads, logs, and backups directories with proper permissions
RUN mkdir -p src/uploads logs backups && \
    chmod -R 755 src/uploads logs backups

# Expose port
EXPOSE 5000

# Start application
CMD ["npm", "start"]