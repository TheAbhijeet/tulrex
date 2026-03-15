#  Stage 1: Build the Next.js App 
FROM node:22-alpine AS builder

WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files first for layer caching
COPY package.json pnpm-lock.yaml ./

# Create pnpm-workspace.yaml for git dependency allowlist
RUN printf 'onlyBuiltDependencies:\n  - "@codemirror/lang-javascript"\n' > pnpm-workspace.yaml

# Memory-safe environment variables
ENV NODE_OPTIONS="--max-old-space-size=512"
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Install dependencies - simple, no cache mounts (avoids BuildKit dependency)
RUN pnpm install --frozen-lockfile --network-concurrency 1 --child-concurrency 1

# Copy source code
COPY . .

# Build with memory limits
RUN NODE_OPTIONS="--max-old-space-size=512" pnpm build

#  Stage 2: Production Nginx Server 
FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/out /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]