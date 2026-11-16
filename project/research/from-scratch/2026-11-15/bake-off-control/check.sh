#!/usr/bin/env bash
# Usage: check.sh <trial-dir> <html-validate bin>
# End state, re-run by us after the session: tsc, a fresh render, html-validate (recommended) per screen.
dir="$1"; hv="$2"; cd "$dir"
echo "\$ npx tsc --noEmit"; npx tsc --noEmit; echo "tsc_exit=$?"
rm -rf out.check; cp -r out out.check 2>/dev/null
echo "\$ npx tsx src/render.ts"; npx tsx src/render.ts; echo "render_exit=$?"
cmp -s out/s1.html out.check/s1.html && cmp -s out/s2.html out.check/s2.html && echo "rerender identical to session output" || echo "rerender differs from session output"
rm -rf out.check
echo '{"extends":["html-validate:recommended"]}' > .htmlvalidate.check.json
for f in out/s1.html out/s2.html; do echo "\$ html-validate -c .htmlvalidate.check.json $f"; "$hv" -c .htmlvalidate.check.json "$f"; echo "hv_exit=$?"; done
rm -f .htmlvalidate.check.json
