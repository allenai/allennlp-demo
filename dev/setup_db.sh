#!/usr/bin/env bash
set -e

dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

port=${DEMO_POSTGRES_PORT:-5432}
schema_file="${1:-$dir/../api/allennlp_demo/permalinks/schema.sql}"

conn_str="postgresql://${DEMO_POSTGRES_USER}@${DEMO_POSTGRES_HOST}:$port"
echo "using connection string: $conn_str..."

# The database doesn't start up immediately, so we perpetually attempt to
# execute a dummy query until it works.
set +e
is_db_up=1
function check_is_db_up {
    psql "$conn_str" -c "SELECT 1" 1>/dev/null 2>&1
    is_db_up=$?
}
while [[ $is_db_up -ne 0 ]]; do
    echo "✨ waiting for db..."
    sleep 1
    check_is_db_up
done
set -e

echo "✨ db is up..."

set +e
# Check if the database already exists. This was adapted from:
# https://stackoverflow.com/questions/14549270/check-if-database-exists-in-postgresql-using-shell
psql -lqt "$conn_str" | cut -d \| -f 1 | grep -qw "$DEMO_POSTGRES_DBNAME" 1>/dev/null
db_exists=$?
set -e

# If the database already exists we assume the schema was already applied.
if [[ $db_exists -eq 0 ]]; then
    echo "⚡️ db already setup"
    exit 0
fi

# Otherwise apply the schema.
echo "✨ initializing schema..."
psql "$conn_str" -c "CREATE DATABASE ${DEMO_POSTGRES_DBNAME}"
psql "$conn_str/${DEMO_POSTGRES_DBNAME}" < "$schema_file"

echo "⚡️ db setup"
