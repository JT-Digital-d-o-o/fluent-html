#!/usr/bin/env bash
# Usage: setup.sh <trial-dir>
# A fresh folder outside every repo with the correct-by-construction prototype (Strict Tags) installed
# as package "strict-tags" (a file: dependency on ./strict-tags: lib/core.ts, lib/tw.gen.ts, lib/index.ts,
# exports "." -> index.ts), its REFERENCE.md in docs/ (the only document the session gets), the theme
# tw.gen.ts was generated from at src/theme.css (where the reference says classes are checked),
# zod 4.1.12 as the Standard Schema the reference names for action bodies, and the control's tsconfig
# plus allowImportingTsExtensions (the lib imports ./tw.gen.ts with its extension).
# Left out on purpose: screens/ and support/ (the worked example app), bench/, xss/, probes/, tools/,
# out/ (measurement artifacts, not the package). The check is tsc alone, as the reference says.
set -euo pipefail
src=/Users/tony/jt-digital/fluent-html/project/research/from-scratch/2026-11-15/proto-correct-by-construction
dir="$1"
[ -e "$dir" ] && { echo "exists: $dir" >&2; exit 1; }
mkdir -p "$dir/docs" "$dir/strict-tags" "$dir/src"
cp "$src/REFERENCE.md" "$dir/docs/REFERENCE.md"
cp "$src"/lib/{core,tw.gen,index}.ts "$dir/strict-tags/"
cat > "$dir/strict-tags/package.json" <<'JSON'
{ "name": "strict-tags", "version": "0.0.0-proto", "private": true, "type": "module",
  "exports": { ".": "./index.ts" } }
JSON
cp "$src/support/theme.css" "$dir/src/theme.css"
cat > "$dir/package.json" <<'JSON'
{ "name": "trial", "private": true, "type": "module",
  "dependencies": { "strict-tags": "file:./strict-tags", "zod": "4.1.12" },
  "devDependencies": { "typescript": "5.9.3", "tsx": "4.20.6", "@types/node": "25.2.1" } }
JSON
cat > "$dir/tsconfig.json" <<'JSON'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "allowImportingTsExtensions": true,
    "types": ["node"]
  },
  "include": ["src"]
}
JSON
(cd "$dir" && npm install --no-audit --no-fund --silent)
