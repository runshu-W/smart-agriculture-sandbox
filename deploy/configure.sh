#!/usr/bin/env bash
set -euo pipefail
DEPLOY_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
AGRI_ENV_FILE="${AGRI_ENV_FILE:-$DEPLOY_DIR/.env}"
if [[ -e "$AGRI_ENV_FILE" ]]; then
  echo "Configuration already exists; left unchanged: $AGRI_ENV_FILE"
  exit 0
fi
umask 077
set -o noclobber
{
  printf 'COMPOSE_PROJECT_NAME=smart-agriculture\nAPP_PORT=3001\n'
  printf 'APP_IMAGE=smart-agriculture-app:local\nTOOLS_IMAGE=smart-agriculture-tools:local\nPOSTGRES_IMAGE=postgres:18-alpine\n'
  printf 'POSTGRES_PASSWORD=%s\n' "$(openssl rand -hex 24)"
  printf 'DEMO_PASSWORD=%s\n' "$(openssl rand -hex 16)"
} > "$AGRI_ENV_FILE"
echo "Created $AGRI_ENV_FILE (owner-only permissions). Credentials are not printed."
