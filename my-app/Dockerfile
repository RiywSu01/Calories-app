# Use the official Node.js 20 lightweight Alpine image as the base image for building
FROM node:20-alpine AS builder

# Set the working directory inside the container to /app
WORKDIR /app

# Copy the package.json and package-lock.json files to the working directory
COPY package*.json ./

# Install the project dependencies using npm ci for a clean, deterministic install
RUN npm ci

# Copy the rest of the application source code to the working directory
COPY . .

# Run the build script defined in package.json (Next.js build)
RUN npm run build

# Start a new stage for the production runner to keep the final image small
FROM node:20-alpine AS runner

# Set the working directory for the production container
WORKDIR /app

# Copy the build output from the builder stage
COPY --from=builder /app/.next ./.next

# Copy the node_modules folder from the builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy the package.json file for runtime scripts and dependencies info
COPY --from=builder /app/package.json ./

# Copy the public folder containing static assets (if it exists)
# Next.js serves files from the public directory
COPY --from=builder /app/public ./public

# Expose port 3000 to allow traffic into this container
EXPOSE 3000

# Start the Next.js production server
CMD ["npm", "run", "start"]
