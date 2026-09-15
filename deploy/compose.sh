#!/usr/bin/env bash
set -euo pipefail
DEPLOY_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
AGRI_ENV_FILE="${AGRI_ENV_FILE:-$DEPLOY_DIR/.env}"
if [[ ! -f "$AGRI_ENV_FILE" ]]; then
  echo "Missing configuration: $AGRI_ENV_FILE. Run deploy/configure.sh first." >&2
  exit 1
fi
exec docker compose --env-file "$AGRI_ENV_FILE" -f "$DEPLOY_DIR/../compose.yaml" "$@"
