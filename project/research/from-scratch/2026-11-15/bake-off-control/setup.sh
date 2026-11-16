#!/usr/bin/env bash
# Usage: setup.sh <trial-dir> <tarball> <reference.md>...
# A fresh folder outside every repo: the arm's package, TypeScript and tsx, a strict tsconfig, the references in docs/.
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
dir="$1"; tgz="$2"; shift 2
[ -e "$dir" ] && { echo "exists: $dir" >&2; exit 1; }
mkdir -p "$dir/docs"
cp "$tgz" "$dir/"
cat > "$dir/package.json" <<JSON
{ "name": "trial", "private": true, "type": "module",
  "dependencies": { "$(basename "$tgz" | sed -E 's/-[0-9.]+\.tgz$//')": "file:./$(basename "$tgz")" },
  "devDependencies": { "typescript": "5.9.3", "tsx": "4.20.6", "@types/node": "25.2.1" } }
JSON
cp "$here/tsconfig.json" "$dir/tsconfig.json"
for ref in "$@"; do cp "$ref" "$dir/docs/"; done
(cd "$dir" && npm install --no-audit --no-fund --silent)
