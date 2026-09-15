#!/usr/bin/env bash
set -euo pipefail
DEPLOY_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
if [[ $# -ne 1 || ! -f "$1" ]]; then
  echo "Usage: deploy/restore.sh /absolute/path/backup.dump (empty destination only)" >&2
  exit 1
fi
if [[ -n "$("$DEPLOY_DIR/compose.sh" ps --status running -q app)" ]]; then
  echo "Stop this project's app before restoring." >&2
  exit 1
fi
"$DEPLOY_DIR/compose.sh" up -d --wait db
AGRI_TABLE_COUNT="$("$DEPLOY_DIR/compose.sh" exec -T db psql -U smart_agri -d smart_agri -Atc "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';")"
if [[ "$AGRI_TABLE_COUNT" != "0" ]]; then
  echo "Restore refused: destination is not empty. Use a new project/data volume." >&2
  exit 1
fi
"$DEPLOY_DIR/compose.sh" exec -T db pg_restore --list < "$1" > /dev/null
"$DEPLOY_DIR/compose.sh" exec -T db pg_restore -U smart_agri -d smart_agri --no-owner --no-acl --exit-on-error --single-transaction < "$1"
echo "Restore complete. Run deploy/start.sh to apply migrations and start the app."
