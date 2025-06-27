
#!/bin/bash
# wait-for.sh

set -e

host="$1"
port="$2"
shift 2
cmd="$@"

until nc -z "$host" "$port"; do
  >&2 echo "Database is unavailable - sleeping"
  sleep 1
done


>&2 echo "✅ $host:$port is up - running migrations and starting app"

# npm run migration:run
npm run start:prod
