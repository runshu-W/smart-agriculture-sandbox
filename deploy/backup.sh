#!/usr/bin/env bash
set -euo pipefail
DEPLOY_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
AGRI_BACKUP_DIR="${AGRI_BACKUP_DIR:-$DEPLOY_DIR/backups}"
umask 077
mkdir -p -- "$AGRI_BACKUP_DIR"
AGRI_BACKUP_FILE="$AGRI_BACKUP_DIR/smart-agriculture-$(date -u +%Y%m%dT%H%M%SZ)-$$.dump"
AGRI_TEMP_FILE="$AGRI_BACKUP_FILE.partial"
trap 'rm -f -- "$AGRI_TEMP_FILE"' EXIT
"$DEPLOY_DIR/compose.sh" exec -T db sh -c 'exec pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --format=custom --no-owner --no-acl' > "$AGRI_TEMP_FILE"
# Verify the archive header/catalog before advertising a completed backup.
"$DEPLOY_DIR/compose.sh" exec -T db pg_restore --list < "$AGRI_TEMP_FILE" > /dev/null
mv -- "$AGRI_TEMP_FILE" "$AGRI_BACKUP_FILE"
echo "$AGRI_BACKUP_FILE"
