#!/bin/sh
# Parity hatch probe: each design's tsc on the HX-1 and HX-7 mistakes written through the other spelling.
B=$(cd "$(dirname "$0")/.." && pwd); cd "$B/gate-verdict"
run() { echo "== $1"; "$2" -p tsconfig.$1.json --pretty false; echo "exit $?"; }
run fh8 /Users/tony/jt-digital/fluent-html/node_modules/.bin/tsc
run fluent-nine "$B/proto-fluent-nine/node_modules/.bin/tsc"
run cbc "$B/proto-correct-by-construction/node_modules/.bin/tsc"
run page-parts "$B/proto-page-parts/node_modules/.bin/tsc"
for a in fh8 fluent-nine; do echo "== render $a"; (cd "$B/mistakes" && node arms/common/run-seed.mjs ../gate-verdict/$a.ts 2>/dev/null); done
# eslint needs the file inside the suite (its config matches **/fh8.ts under mistakes/): lint a temporary copy.
echo "== eslint fh8"; (cd "$B/mistakes" && mkdir -p seeds/ZZ-GATE && sed 's#../mistakes/arms/#../../arms/#' ../gate-verdict/fh8.ts > seeds/ZZ-GATE/fh8.ts && /Users/tony/jt-digital/fluent-html-eslint-plugin/node_modules/.bin/eslint -c eslint.fh8.config.mjs --max-warnings=0 seeds/ZZ-GATE/fh8.ts; echo "exit $?"; rm -r seeds/ZZ-GATE)
