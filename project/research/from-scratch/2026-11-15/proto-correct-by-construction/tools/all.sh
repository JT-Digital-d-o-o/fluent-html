#!/bin/sh
# Every measurement of this prototype, in order. Run from anywhere: sh tools/all.sh
set -e
cd "$(dirname "$0")/.."
B=..
node tools/gen.mjs support/theme.css lib
node_modules/.bin/tsc -p tsconfig.json && echo "screens: tsc exit 0"
node_modules/.bin/tsc -p probes/tsconfig.json && echo "valid controls: tsc exit 0"
node_modules/.bin/tsc -p probes/tsconfig.reference.json && echo "reference examples: tsc exit 0"
node tools/mistakes.mjs > out/mistakes.txt; tail -1 out/mistakes.txt
node tools/run-screens.mjs > out/run-screens.txt; tail -1 out/run-screens.txt
node tools/check.mjs tsconfig.json support/theme.css --out out/classes.css | tee out/check.txt
node tools/css-build.mjs support/theme.css out/classes.css
node tools/three-states.mjs
node tools/bench-page-diff.mjs
node $B/fixtures/xss/check.mjs xss/adapter.mjs > out/xss.txt || true; head -1 out/xss.txt
for f in out/*.html; do echo "$(basename "$f") errors=$(node_modules/.bin/html-validate -c .htmlvalidate.json -f text "$f" | grep -c error || true)"; done | tee out/html-validate.txt
for r in 1 2; do NODE_ENV=production node --expose-gc $B/fixtures/bench/harness.mjs --rounds 11 --sample-ms 300 --json $B/fixtures/bench/arms/fluent-html-8.mjs bench/strict-tags.mjs $B/proto-lean-tags/bench/lean-tags.mjs $B/fixtures/bench/arms/template-literal.mjs > out/bench-run$r.json; done
