# Docker Tutorial: Containerizing Calories-app

This guide explains how we containerized your `Calories-app` project. It will walk you through the `Dockerfile`s, `.dockerignore` files, and `docker-compose.yml`, explaining *what* each part does and *why* it's there.

## What is Docker?

Docker is a tool that packages your application and its dependencies into a "container." Think of a container as a lightweight, portable virtual machine that has exactly what your app needs to run, ensuring that if it works on your machine, it will work anywhere.

---

## 1. The Frontend (`my-app/Dockerfile`)

The Next.js frontend uses a **multi-stage build**. This means we use one environment to *build* the app, and a separate, smaller environment to *run* the app. This keeps the final image lightweight and secure.

```dockerfile
# Stage 1: The Builder
# We use the official Node 20 "alpine" image. Alpine is a very small, lightweight version of Linux.
FROM node:20-alpine AS builder

# We set the working directory to /app so all subsequent commands run inside this folder.
WORKDIR /app

# We copy package.json and package-lock.json first. 
# Why? Docker caches layers. By copying only these files first, Docker can cache the 'npm ci' step unless you change your dependencies.
COPY package*.json ./

# 'npm ci' is like 'npm install', but strictly follows package-lock.json for a deterministic install.
RUN npm ci

# Now we copy the rest of your application code into the container.
COPY . .

# We run Next.js build which creates the optimized production output in the '.next' folder.
RUN npm run build


# Stage 2: The Runner
# We start a fresh, new image. This leaves behind all the junk from the build process.
FROM node:20-alpine AS runner
WORKDIR /app

# We selectively copy ONLY what we need to run the app from the 'builder' stage.
# We need the built files (.next), dependencies (node_modules), package.json, and static assets (public).
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/public ./public

# We tell Docker that this container listens on port 3000.
EXPOSE 3000

# The default command that runs when the container starts.
CMD ["npm", "run", "start"]
```

### The `.dockerignore`

Just like `.gitignore` prevents files from going to GitHub, `.dockerignore` prevents files from being copied into the Docker image. We ignore `node_modules` and `.next` because we want to build them *inside* the container, not copy the ones from your local computer (which might be incompatible with Linux).

---

## 2. The Backend (`nest-prisma/Dockerfile`)

The NestJS backend also uses a multi-stage build, but it has an extra step: **Prisma generation**.

```dockerfile
# Stage 1: The Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Prisma needs your schema.prisma to generate the database client.
COPY prisma ./prisma/

# We run 'npx prisma generate' to create the TypeScript/JavaScript client that NestJS uses to talk to the DB.
RUN npx prisma generate

# Copy the rest of the code and build NestJS (creates the 'dist' folder).
COPY . .
RUN npm run build


# Stage 2: The Runner
FROM node:20-alpine AS runner
WORKDIR /app

# Copy dependencies, compiled code, and the Prisma folder.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./
COPY --from=builder /app/tsconfig.json ./

# Critical step: Because you configured Prisma to output to 'src/generated/prisma', 
# NestJS's build might not bundle the underlying C++ binary engine. We explicitly copy it.
COPY --from=builder /app/src/generated ./src/generated
COPY --from=builder /app/package.json ./

# We expose port 3001.
EXPOSE 3001

# The start command.
CMD ["npm", "run", "start:prod"]
```

---

## 3. Orchestration (`docker-compose.yml`)

`docker-compose` is a tool for defining and running multi-container Docker applications. Since your app needs a Database, a Backend, and a Frontend, Docker Compose starts all three and connects them to the same network.

```yaml
version: '3.8'

services:
  # 1. Database Service
  db:
    # You requested Postgres 18. Docker will pull this image from Docker Hub.
    image: postgres:18
    restart: always
    # We pass in the username, password, and database name from your .env file.
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: RiywSuPasS4252_
      POSTGRES_DB: postgres
    ports:
      - "5432:5432"
    # Data in containers is temporary! We use a 'volume' to save your database data to your hard drive permanently.
    volumes:
      - postgres_data:/var/lib/postgresql

  # 2. Backend Service
  backend:
    build:
      context: ./nest-prisma
    # We map host port 3001 to container port 3001.
    ports:
      - "3001:3001"
    environment:
      PORT: 3001
      # Note the URL uses '@db'. In docker-compose, services can talk to each other using their service names!
      DATABASE_URL: "postgres://postgres:RiywSuPasS4252_@db:5432/postgres"
    
    # Is it necessary to set up migrations? 
    # Yes! Without running migrations, your database will be empty and the app will crash when it tries to read data.
    # We use 'npx prisma migrate deploy' to automatically run your custom SQL migrations when the container starts.
    command: sh -c "npx prisma migrate deploy && npm run start:prod"
    depends_on:
      - db

  # 3. Frontend Service
  frontend:
    build:
      context: ./my-app
    ports:
      - "3000:3000"
    environment:
      # The frontend needs to know where the backend is to make API requests.
      NEXT_PUBLIC_API_URL: "http://localhost:3001"
    depends_on:
      - backend

# Declare the persistent volume for the database
volumes:
  postgres_data:
```

### Integrating Your Custom `.sql` File (Migrations)
In your original setup, you had a custom `.sql` file that contained your database schema. We needed to integrate this into Prisma so Docker could automate it.

Here is how we connected your `.sql` to Prisma Migrations:
1. **Created an initial migration:** We generated an empty migration directory (`prisma/migrations/0_init`).
2. **Copied your SQL:** We copied the exact contents of your custom `.sql` file into the `migration.sql` file inside that new directory.
3. **Switched to `migrate deploy`:** In `docker-compose.yml`, we changed the startup command from `npx prisma db push` to `npx prisma migrate deploy`. 

**Why `migrate deploy` instead of `db push`?**
While `db push` is great for rapid prototyping (it blindly forces the Prisma schema into the database), `migrate deploy` strictly runs the `.sql` migration files in your `prisma/migrations` folder. By making this switch, Docker now executes your exact, hand-written `.sql` instructions to set up the database before the NestJS server starts!

## Troubleshooting & Fixes Applied

During the initial setup, a few errors were encountered and resolved. Here is an overview of what went wrong, how it was fixed, and the exact code changes made (showing before and after):

### 1. PostgreSQL 18+ Data Directory Configuration
* **The Error:** The `db` container failed to start correctly, complaining about the `/var/lib/postgresql/data` mount point.
* **The Reason:** The official PostgreSQL 18 image requires that the volume be mounted at `/var/lib/postgresql` rather than `/var/lib/postgresql/data`, as it now manages its own version-specific subdirectories.
* **The Fix:** Updated the volume mapping in `docker-compose.yml` to use `/var/lib/postgresql`.
* **The Code Change:**
  ```yaml
  # Old:
  volumes:
    - postgres_data:/var/lib/postgresql/data

  # New:
  volumes:
    - postgres_data:/var/lib/postgresql
  ```

### 2. Missing Prisma Configuration
* **The Error:** The backend container crashed with: `Error: The datasource.url property is required in your Prisma config file`.
* **The Reason:** Prisma v7 uses a configuration file (`prisma.config.ts`). Originally, the Dockerfile's runner stage was not copying this file, so Prisma couldn't find the database URL during the migration step.
* **The Fix:** Added commands to copy `prisma.config.ts` and `tsconfig.json` into the runner stage inside `nest-prisma/Dockerfile`.
* **The Code Change:**
  ```dockerfile
  # Old:
  COPY --from=builder /app/prisma ./prisma

  # New:
  COPY --from=builder /app/prisma ./prisma
  COPY --from=builder /app/prisma.config.ts ./
  COPY --from=builder /app/tsconfig.json ./
  ```

### 3. Nested TypeScript Compilation Output
* **The Error:** The backend container failed to start with: `Error: Cannot find module '/app/dist/main'`.
* **The Reason:** Because `prisma.config.ts` is located in the root folder, the TypeScript compiler (when building the NestJS app) included it. This caused the compiler to preserve the root structure, outputting the NestJS application into `dist/src/main.js` instead of `dist/main.js`.
* **The Fix:** Added `"prisma.config.ts"` to the `exclude` array in `nest-prisma/tsconfig.build.json`. This ensures the NestJS build only compiles the `src` folder, putting `main.js` correctly in the `dist` folder.
* **The Code Change:**
  ```json
  // Old:
  "exclude": ["node_modules", "test", "dist", "**/*spec.ts"]

  // New:
  "exclude": ["node_modules", "test", "dist", "**/*spec.ts", "prisma.config.ts"]
  ```

## How to use this:

To start your entire stack (Frontend, Backend, and Database), open a terminal in the `Calories-app` directory and run:

```bash
docker-compose up --build
```

- Add `-d` to run it in the background (`docker-compose up --build -d`).
- To stop the app, run `docker-compose down`.
