#!/bin/sh
# entrypoint.sh

set -e

# Wait for the database to be ready
./wait-for.sh ${DB_HOST:-db} 3306

# Run migrations
echo "Running database migrations..."
npm run migration:run

# Start the application
echo "Starting application..."
exec npm run start:prod