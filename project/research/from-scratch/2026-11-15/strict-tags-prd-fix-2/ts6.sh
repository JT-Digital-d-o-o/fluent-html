#!/bin/sh
# The fleet's third compiler, which draft 2 left out: Strict Tags' type-checks on TypeScript 6.0.3 against 5.9.3 and 7.0.2.
# Error counts on the same six configs as ../strict-tags-prd/ts7.sh, the mistake probe's positions and codes, and the
# house-rule probe.   sh ts6.sh > ts6.txt
B=$(cd "$(dirname "$0")/.." && pwd); S=$$; D=$(dirname "$0")
T5=/Users/tony/jt-digital/fluent-html/node_modules/.bin/tsc
T6=/Users/tony/jt-digital/everyframe-composer/node_modules/typescript/bin/tsc
T7=/Users/tony/jt-digital/everyframe-composer/node_modules/@typescript/native/bin/tsc
cd "$B/proto-correct-by-construction"
for cfg in tsconfig.json probes/tsconfig.json probes/tsconfig.reference.json probes/tsconfig.mistakes.json probes/tsconfig.components.json probes/tsconfig.helpers.json; do
  echo "$cfg errors: 5.9.3=$($T5 -p $cfg --pretty false 2>&1 | grep -c 'error TS') 6.0.3=$($T6 -p $cfg --pretty false 2>&1 | grep -c 'error TS') 7.0.2=$($T7 -p $cfg --pretty false 2>&1 | grep -c 'error TS')"
done
$T6 -p tsconfig.json --pretty false 2>&1 | grep 'error TS' | grep -vE '^[a-z].*\(' | head -3
pos() { $1 -p probes/tsconfig.mistakes.json --pretty false 2>&1 | grep -E '^probes/mistakes.ts\(' ; }
pos $T5 > "$D/.p5.$S"; pos $T6 > "$D/.p6.$S"; pos $T7 > "$D/.p7.$S"
for v in 5 6 7; do grep -oE '^[^:]+' "$D/.p$v.$S" | sort > "$D/.q$v.$S"; grep -oE '^[^:]+: error TS[0-9]+' "$D/.p$v.$S" | sort > "$D/.c$v.$S"; done
echo "mistake probe positions: 5.9.3=$(wc -l < "$D/.q5.$S" | tr -d ' ') 6.0.3=$(wc -l < "$D/.q6.$S" | tr -d ' ') 7.0.2=$(wc -l < "$D/.q7.$S" | tr -d ' '); 6.0.3 differs from 5.9.3 at $(comm -3 "$D/.q5.$S" "$D/.q6.$S" | wc -l | tr -d ' '), with another code at $(comm -23 "$D/.c5.$S" "$D/.c6.$S" | wc -l | tr -d ' '); 7.0.2 differs from 6.0.3 at $(comm -3 "$D/.q6.$S" "$D/.q7.$S" | wc -l | tr -d ' ')"
echo "first line carries the fix: 5.9.3=$(grep -c '✗' "$D/.p5.$S") 6.0.3=$(grep -c '✗' "$D/.p6.$S") 7.0.2=$(grep -c '✗' "$D/.p7.$S")"
rm -f "$D"/.[pqc][567].$S
