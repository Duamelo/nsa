#!/bin/bash
# entrypoint.sh

set -e

# Wait for the database to be ready
/wait-for.sh ${DB_HOST:-db} 3306

# Run migrations
echo "Running database migrations..."
yarn migration:start

# Start the application
echo "Starting application..."
exec yarn start