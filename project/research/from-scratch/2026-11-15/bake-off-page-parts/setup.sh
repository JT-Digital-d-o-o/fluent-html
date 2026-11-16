#!/usr/bin/env bash
# Usage: setup.sh <trial-dir>
# A fresh folder outside every repo with the Page Parts prototype installed as package "page-parts"
# (node_modules/page-parts -> ./kit, a file: dependency), its class check and theme in tools/, its
# worked example app (screens/, server.ts), the reference in docs/, and the control's tsconfig options
# plus allowImportingTsExtensions (the kit imports with .ts extensions).
# Left out on purpose: bench/, xss/, test/, out/ (measurement artifacts, not the package: the tests
# import ../../fixtures, which does not exist in a trial folder).
set -euo pipefail
src=/Users/tony/jt-digital/fluent-html/project/research/from-scratch/2026-11-15/proto-page-parts
dir="$1"
[ -e "$dir" ] && { echo "exists: $dir" >&2; exit 1; }
mkdir -p "$dir/docs" "$dir/kit" "$dir/tools" "$dir/screens"
cp "$src/REFERENCE.md" "$dir/docs/REFERENCE.md"
cp "$src"/kit/{core,parts,schema,node,index}.ts "$dir/kit/"
cat > "$dir/kit/package.json" <<'JSON'
{ "name": "page-parts", "version": "0.0.0", "private": true, "type": "module", "exports": { ".": "./index.ts", "./node": "./node.ts" } }
JSON
cp "$src"/tools/{theme.css,check-classes.mjs,css-coverage.mjs,validate-summary.mjs} "$dir/tools/"
cp "$src"/screens/{projects,styles,data}.ts "$dir/screens/"
cp "$src/server.ts" "$dir/server.ts"
cat > "$dir/package.json" <<'JSON'
{ "name": "trial", "private": true, "type": "module",
  "scripts": {
    "check": "tsc --noEmit && node tools/check-classes.mjs tools/theme.css src",
    "css": "tailwindcss -i tools/theme.css -o public/app.css"
  },
  "dependencies": { "page-parts": "file:./kit" },
  "devDependencies": { "typescript": "5.9.3", "tsx": "4.20.6", "@types/node": "25.2.1",
    "tailwindcss": "4.3.3", "@tailwindcss/cli": "4.3.3" } }
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
