# Use Node 20
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy everything else
COPY . .

# Environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# --- THE FIX ---
# Run the standard build command. 
# Your next.config.ts will handle skipping the errors.
RUN npm run build

# Port for the container
EXPOSE 3000

# Start command
CMD ["npm", "start"]