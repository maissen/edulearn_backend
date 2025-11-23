# Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production=false

# Copy application code
COPY . .

# Create uploads and logs directories
RUN mkdir -p src/uploads logs

# Expose port
EXPOSE 5000

# Start application
CMD ["npm", "start"]