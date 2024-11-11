#!/bin/bash
set -e

# Create data directory if it doesn't exist
mkdir -p /app/data

# Initialize SQLite database if it doesn't exist
if [ ! -f /app/data/database.sqlite ]; then
    echo "Initializing SQLite database..."
    sqlite3 /app/data/database.sqlite < /app/packages/core/src/adapters/sqlite/schema.sql
fi

# Start SQLite Web interface in background
echo "Starting SQLite web interface..."
pnpm dlx sqlite-web /app/data/database.sqlite --host 0.0.0.0 --port 8080 &

# Start the main application from the agent package
echo "Starting Eliza..."
cd packages/agent
exec pnpm start