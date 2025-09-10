#  Stage 1: Build the Next.js App 
# Use a Node.js image with pnpm pre-installed for the build environment
FROM node:22-alpine AS builder

# Set the working directory
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate


# Copy package files and install dependencies
# This layer is cached by Docker unless package.json or pnpm-lock.yaml changes
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy the rest of the application source code
COPY . .

# Run the build command, which generates the static 'out' directory
RUN pnpm build

#  Stage 2: Create the Production Nginx Server 
# Use the official, lightweight Nginx image for the production environment
FROM nginx:alpine

# Remove the default Nginx welcome page
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom Nginx configuration
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Copy the static build output from the 'builder' stage to the Nginx html directory
COPY --from=builder /app/out /usr/share/nginx/html

# Expose port 80 to allow traffic to the Nginx server
EXPOSE 80
