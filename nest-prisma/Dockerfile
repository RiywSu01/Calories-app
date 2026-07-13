# Use the official Node.js 20 lightweight Alpine image as the base image for building
FROM node:20-alpine AS builder

# Set the working directory inside the container to /app
WORKDIR /app

# Copy the package.json and package-lock.json files to the working directory
COPY package*.json ./

# Install the project dependencies using npm ci for a clean, deterministic install
RUN npm ci

# Copy the prisma folder so that we can generate the Prisma client
COPY prisma ./prisma/

# Generate the Prisma client so that the backend can interact with the DB
# This will output to src/generated/prisma as configured in schema.prisma
RUN npx prisma generate

# Copy the rest of the application source code to the working directory
COPY . .

# Run the NestJS build script to compile TypeScript to JavaScript in the dist folder
RUN npm run build

# Start a new stage for the production image to keep it lightweight
FROM node:20-alpine AS runner

# Set the working directory for the production container
WORKDIR /app

# Copy the node_modules from the builder stage (contains dependencies)
COPY --from=builder /app/node_modules ./node_modules

# Copy the compiled application code from the dist folder
COPY --from=builder /app/dist ./dist

# Copy the prisma folder to the runner stage so we can run db push on startup
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./
COPY --from=builder /app/tsconfig.json ./

# Copy the generated Prisma client from src/generated to ensure binaries are included
# The NestJS build might not copy non-TS binary files, so we copy them explicitly
COPY --from=builder /app/src/generated ./src/generated

# Copy the package.json to be able to run scripts if needed
COPY --from=builder /app/package.json ./

# Expose port 3001 to allow traffic into this container
EXPOSE 3001

# The default command runs the production version of the app
CMD ["npm", "run", "start:prod"]
