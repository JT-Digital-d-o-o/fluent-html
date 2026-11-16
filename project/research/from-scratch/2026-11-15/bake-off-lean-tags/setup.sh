#!/usr/bin/env bash
# Usage: setup.sh <trial-dir>
# A fresh folder outside every repo with the Lean Tags prototype installed as package "lean-tags"
# (file: dependency on ./lean-tags: dist/, check.mjs as the lean-tags-check bin, package.json, src/),
# the reference in docs/, the theme at src/theme.css (where the reference's check command looks),
# zod as the Standard Schema the reference names for post() bodies, tailwindcss for the class check,
# and the control's tsconfig unchanged.
# Left out on purpose: the worked example (screens/, support/), bench/, xss/, test/, probes/, out/,
# control/ (measurement artifacts and the reference's own example, not the package), and REFERENCE.md
# inside the package copy (the session gets it once, in docs/, as the control does).
set -euo pipefail
src=/Users/tony/jt-digital/fluent-html/project/research/from-scratch/2026-11-15/proto-lean-tags
here="$(cd "$(dirname "$0")" && pwd)"
dir="$1"
[ -e "$dir" ] && { echo "exists: $dir" >&2; exit 1; }
mkdir -p "$dir/docs" "$dir/lean-tags/dist" "$dir/lean-tags/src" "$dir/src"
cp "$src/lean-tags/REFERENCE.md" "$dir/docs/REFERENCE.md"
cp "$src"/lean-tags/dist/index.{js,d.ts} "$dir/lean-tags/dist/"
cp "$src/lean-tags/src/index.ts" "$dir/lean-tags/src/"
# The prototype's check.mjs has no shebang, so its npm bin runs under sh and fails; the copy gets one.
{ echo "#!/usr/bin/env node"; cat "$src/lean-tags/check.mjs"; } > "$dir/lean-tags/check.mjs"
chmod +x "$dir/lean-tags/check.mjs"
cat > "$dir/lean-tags/package.json" <<'JSON'
{ "name": "lean-tags", "version": "0.0.0-proto", "private": true, "type": "module",
  "exports": { ".": { "types": "./dist/index.d.ts", "default": "./dist/index.js" } },
  "bin": { "lean-tags-check": "./check.mjs" } }
JSON
cp "$src/support/theme.css" "$dir/src/theme.css"
cat > "$dir/package.json" <<'JSON'
{ "name": "trial", "private": true, "type": "module",
  "dependencies": { "lean-tags": "file:./lean-tags", "zod": "4.1.12" },
  "devDependencies": { "typescript": "5.9.3", "tsx": "4.20.6", "@types/node": "25.2.1", "tailwindcss": "4.3.3" } }
JSON
cp "$here/../bake-off-control/tsconfig.json" "$dir/tsconfig.json"
(cd "$dir" && npm install --no-audit --no-fund --silent)
