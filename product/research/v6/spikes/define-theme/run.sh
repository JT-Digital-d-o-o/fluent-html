#!/usr/bin/env bash
# Build + measure the three defineTheme approaches with real `tsc`.
# Each usage.ts has the same 6 cases; the tsc errors reveal the accept/reject matrix.
set -u
DIR="$(cd "$(dirname "$0")" && pwd)"
TSC="/Users/tony/jt-digital/fluent-html/node_modules/.bin/tsc"

run_tsc () {
  echo "═══════════════════════════════════════════════════════════"
  echo "$1"
  echo "═══════════════════════════════════════════════════════════"
  if ( cd "$2" && "$TSC" -p tsconfig.json ); then
    echo "RESULT: clean compile — 0 errors (every case accepted)"
  else
    echo "RESULT: ↑ tsc errors above (line N = case N)"
  fi
  echo
}

echo "### codegen step (spike 02 only): define-once → generate types/css/manifest"
( cd "$DIR/02-closed-codegen" && node codegen.ts )
echo

run_tsc "00  OPEN UNION  (status quo / v5: \`(string & {})\` tail)"        "$DIR/00-open-union"
run_tsc "01  CLOSED + declare module  (runtime defineTheme + hand augment)" "$DIR/01-closed-declare-module"
run_tsc "02  CLOSED + codegen  (single source → generated .d.ts)"           "$DIR/02-closed-codegen"
