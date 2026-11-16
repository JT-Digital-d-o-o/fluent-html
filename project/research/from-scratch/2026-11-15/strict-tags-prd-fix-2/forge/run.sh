#!/bin/sh
# Which of spellings 9 to 16 compile on the fleet's three compilers, and what they render.
cd "$(dirname "$0")"
T5=/Users/tony/jt-digital/fluent-html/node_modules/.bin/tsc
T6=/Users/tony/jt-digital/everyframe-composer/node_modules/typescript/bin/tsc
T7=/Users/tony/jt-digital/everyframe-composer/node_modules/@typescript/native/bin/tsc
printf '{ "extends": "../../strict-tags/tsconfig.json", "include": ["../../strict-tags/lib/*.ts", "forge.ts"] }\n' > tsconfig.json
for T in $T5 $T6 $T7; do $T -p tsconfig.json --pretty false > .raw 2>&1; echo "$($T --version): spellings 8, error lines $(grep -oE '^forge\.ts\(([0-9]+)' .raw | sort -u | wc -l | tr -d ' ') (the control is line 7)"; grep '^forge.ts' .raw | cut -c1-170; done
node render.ts 2>&1 | grep -v -i 'warning\|--trace'
rm -f .raw tsconfig.json
