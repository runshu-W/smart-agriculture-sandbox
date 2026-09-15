#!/usr/bin/env bash
set -euo pipefail
DEPLOY_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
if [[ $# -ne 1 || -e "$1" ]]; then
  echo "Usage: deploy/package.sh /absolute/path/to/new-release-directory" >&2
  exit 1
fi
umask 077
mkdir -p -- "$1/deploy/nginx"
AGRI_RELEASE_DIR="$(cd -- "$1" && pwd)"
cp "$DEPLOY_DIR/../compose.yaml" "$AGRI_RELEASE_DIR/"
cp "$DEPLOY_DIR/"*.sh "$DEPLOY_DIR/.env.example" "$DEPLOY_DIR/README.md" "$AGRI_RELEASE_DIR/deploy/"
cp "$DEPLOY_DIR/nginx/"*.conf "$AGRI_RELEASE_DIR/deploy/nginx/"
# --images emits image names only, never environment variables or credentials.
AGRI_IMAGES=()
while IFS= read -r image_name; do
  [[ -n "$image_name" ]] && AGRI_IMAGES+=("$image_name")
done < <("$DEPLOY_DIR/compose.sh" --profile ops config --images | sort -u)
if [[ ${#AGRI_IMAGES[@]} -eq 0 ]]; then echo "No images found" >&2; exit 1; fi
docker image save "${AGRI_IMAGES[@]}" | gzip > "$AGRI_RELEASE_DIR/images.tar.gz.partial"
mv "$AGRI_RELEASE_DIR/images.tar.gz.partial" "$AGRI_RELEASE_DIR/images.tar.gz"
(cd "$AGRI_RELEASE_DIR" && shasum -a 256 images.tar.gz > SHA256SUMS)
printf 'Created release at %s\nNo deployment secrets or database backups are included.\n' "$AGRI_RELEASE_DIR"
