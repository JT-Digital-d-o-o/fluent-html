#!/bin/sh
# Type-check everything, then bundle the bench arm and the XSS adapter.
set -e
cd "$(dirname "$0")"
T=../../../../../node_modules/.bin
$T/tsc -p tsconfig.json
for e in bench/page.tsx xss/adapter.tsx screens/render-all.tsx probes/runtime.tsx; do
  [ -f "$e" ] || continue
  $T/esbuild "$e" --bundle --format=esm --platform=node --target=node22 --jsx=automatic --jsx-import-source=sealed \
    --tsconfig=tsconfig.json --outfile="out/$(dirname "$e")-$(basename "$e" .tsx).mjs" --log-level=warning
done
