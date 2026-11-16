#!/bin/sh
# For each compiler: tsc's errors, then the "✗" lines without an error and the error lines without a "✗".   sh run.sh [file.ts]
cd "$(dirname "$0")"
F=${1:-house-rule.ts}
T5=/Users/tony/jt-digital/fluent-html/node_modules/.bin/tsc
T6=/Users/tony/jt-digital/everyframe-composer/node_modules/typescript/bin/tsc
T7=/Users/tony/jt-digital/everyframe-composer/node_modules/@typescript/native/bin/tsc
printf '{ "compilerOptions": { "strict": true, "noEmit": true, "target": "es2022", "module": "esnext", "moduleResolution": "bundler", "skipLibCheck": true, "types": [] }, "files": ["%s"] }\n' "$F" > tsconfig.probe.json
O=out-${F%.ts}.txt; : > $O
for T in $T5 $T6 $T7; do
  V=$($T --version)
  $T -p tsconfig.probe.json --pretty false > .raw 2>&1; X=$?
  grep -n '// ✗' $F | cut -d: -f1 | sort -u > .want
  grep -oE "^$F\(([0-9]+)" .raw | cut -d'(' -f2 | sort -u > .got
  echo "== $V exit=$X seeded=$(wc -l < .want | tr -d ' ') error_lines=$(wc -l < .got | tr -d ' ') missed=[$(comm -23 .want .got | tr '\n' ' ')] stray=[$(comm -13 .want .got | tr '\n' ' ')] first_line_carries_fix=$(grep -E "^$F\(" .raw | grep -cE '✗|u2717')" >> $O
  grep -E "^$F\(" .raw | cut -c1-330 >> $O
done
rm -f .raw .want .got tsconfig.probe.json; cat $O
