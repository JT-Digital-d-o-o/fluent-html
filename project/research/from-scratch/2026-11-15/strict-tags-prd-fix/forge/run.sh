#!/bin/sh
# Which forging spellings compile, on both compilers, and what three of them render.
cd "$(dirname "$0")"
T5=/Users/tony/jt-digital/fluent-html/node_modules/.bin/tsc
T7=/Users/tony/jt-digital/everyframe-composer/node_modules/@typescript/native/bin/tsc
printf '{ "extends": "../../strict-tags/tsconfig.json", "include": ["../../strict-tags/lib/*.ts", "forge.ts"] }\n' > tsconfig.json
for T in $T5 $T7; do $T -p tsconfig.json --pretty false > .raw 2>&1; echo "$($T --version): spellings 8, error lines $(grep -c '^forge.ts' .raw), compile $((8 - $(grep -oE '^forge\.ts\(([0-9]+)' .raw | sort -u | wc -l | tr -d ' ')))"; grep '^forge.ts' .raw | cut -c1-200; done
node render.ts 2>&1 | grep -v Warning
rm -f .raw tsconfig.json
