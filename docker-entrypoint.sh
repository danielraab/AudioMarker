#!/bin/sh
set -e

echo "Starting Audio Marker application..."

# Wait for database directory to be available
echo "Ensuring database directory exists..."
mkdir -p /app/data

# Set the correct DATABASE_URL if not already set
if [ -z "$DATABASE_URL" ]; then
    export DATABASE_URL="file:/app/data/db.sqlite"
fi

echo "Database URL: $DATABASE_URL"

# Run Prisma migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Generate Prisma client (in case it's needed)
echo "Generating Prisma client..."
npx prisma generate

# Ensure uploads directory exists
echo "Ensuring uploads directory exists..."
mkdir -p /app/public/uploads

echo "Starting the application..."

# Execute the main command
exec "$@"