#!/usr/bin/env bash
set -euo pipefail
DEPLOY_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
"$DEPLOY_DIR/compose.sh" up -d --wait db
"$DEPLOY_DIR/compose.sh" run --rm migrate
"$DEPLOY_DIR/compose.sh" up -d --no-deps --wait app
