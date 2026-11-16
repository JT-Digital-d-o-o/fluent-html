#!/bin/sh
# Bundles a .ts/.tsx entry with the rtsx JSX runtime. Usage: tools/build.sh <entry> <outfile>
here="$(cd "$(dirname "$0")/.." && pwd)"
"$here/../../../../../node_modules/.bin/esbuild" "$1" --bundle --format=esm --platform=node --target=node22 \
  --jsx=automatic --jsx-import-source=rtsx --alias:rtsx="$here/rtsx/index.ts" --alias:rtsx/jsx-runtime="$here/rtsx/jsx-runtime.ts" \
  --outfile="$2" --log-level=warning
