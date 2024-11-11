# Use Node 23 instead of 20
FROM --platform=linux/amd64 node:23.3.0

# Install system dependencies and Playwright dependencies in one layer
RUN apt-get update && apt-get install -y \
    python3 \
    build-essential \
    git \
    curl \
    sqlite3 \
    # Playwright dependencies
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libdbus-1-3 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpango-1.0-0 \
    libcairo2 \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN curl -f https://get.pnpm.io/v6.js | node - add --global pnpm

# Set working directory
WORKDIR /app

# Copy package files first
COPY package.json pnpm-workspace.yaml ./
COPY packages/core/package.json ./packages/core/
COPY packages/agent/package.json ./packages/agent/

# Install dependencies
RUN pnpm i

# Clean node_modules before copying source
RUN rm -rf packages/*/node_modules

# Copy source files
COPY . .

# Reinstall and build
RUN pnpm i && \
    cd packages/core && \
    npx playwright install chromium --with-deps && \
    cd ../..

# Build all packages
RUN pnpm -r build

# Create data directory
RUN mkdir -p /app/data && chown -R node:node /app/data

# Expose ports
EXPOSE 3000 8080

# Add entrypoint script
COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

# Switch to non-root user
USER node

# Start the application
ENTRYPOINT ["/docker-entrypoint.sh"]