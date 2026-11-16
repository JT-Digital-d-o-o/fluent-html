#!/usr/bin/env bash
# Usage: setup.sh <trial-dir>
# A fresh folder outside every repo with the Fluent Nine prototype installed as package "fluent-html"
# (a file: dependency on ./fluent-html: dist/ and package.json, built by `npm run build` in
# proto-fluent-nine), its REFERENCE.md in docs/ (the only document the session gets), and the
# control's tsconfig unchanged. The check is tsc alone: there is no class checker to run.
# Left out on purpose: src/ of the package, the screens, bench/, xss/, test/, probes/, out/.
set -euo pipefail
src=/Users/tony/jt-digital/fluent-html/project/research/from-scratch/2026-11-15/proto-fluent-nine
here="$(cd "$(dirname "$0")" && pwd)"
dir="$1"
[ -e "$dir" ] && { echo "exists: $dir" >&2; exit 1; }
[ -f "$src/pkg/dist/index.js" ] || { echo "build first: (cd $src && npm run build)" >&2; exit 1; }
mkdir -p "$dir/docs" "$dir/fluent-html"
cp "$src/pkg/REFERENCE.md" "$dir/docs/REFERENCE.md"
cp -R "$src/pkg/dist" "$dir/fluent-html/dist"
cp "$src/pkg/package.json" "$dir/fluent-html/package.json"
cat > "$dir/package.json" <<'JSON'
{ "name": "trial", "private": true, "type": "module",
  "dependencies": { "fluent-html": "file:./fluent-html" },
  "devDependencies": { "typescript": "5.9.3", "tsx": "4.20.6", "@types/node": "25.2.1" } }
JSON
cp "$here/../bake-off-control/tsconfig.json" "$dir/tsconfig.json"
(cd "$dir" && npm install --no-audit --no-fund --silent)
