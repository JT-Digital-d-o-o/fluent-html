#!/usr/bin/env bash
# Replays the fix loop of the port: per saved step, tsc errors and what `tsx render.ts` says.
#   bash steps.sh
# src.step0 is Lean Tags r1's session source ported to the Strict Tags reference (tw`…` to cls(…), variants to
# functions, doc({ header, footer }), action + redirect); each later step applies the fix its predecessor's output asks for.
cd "$(dirname "$0")"
for s in 0 1 2 3 4 5; do
  printf '{ "extends": "./tsconfig.json", "include": ["src.step%s/**/*.ts"] }\n' "$s" > tsconfig.step.json
  errors=$(node_modules/.bin/tsc -p tsconfig.step.json --pretty false | grep -c "error TS")
  fixtext=$(node_modules/.bin/tsc -p tsconfig.step.json --pretty false | grep "error TS" | grep -c "✗")
  if [ "$errors" = 0 ]; then render=$(node_modules/.bin/tsx "src.step$s/render.ts" 2>&1 | grep -E "^TypeError|^wrote" | cut -c1-90); else render="(not run)"; fi
  echo "step$s tsc_errors=$errors with_fix_text=$fixtext render: $render"
done
rm -f tsconfig.step.json
