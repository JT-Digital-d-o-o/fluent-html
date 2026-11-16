#!/bin/sh
# Strict Tags' type-checks on TypeScript 5.9.3 and 7.0.2: error counts per config, the mistake probe's error positions
# compared, and wall time on the 2,000-element stress file.   sh ts7.sh > ts7.txt
B=$(cd "$(dirname "$0")/.." && pwd)
T5=/Users/tony/jt-digital/fluent-html/node_modules/.bin/tsc
T7=/Users/tony/jt-digital/everyframe-composer/node_modules/@typescript/native/bin/tsc
now() { python3 -I -c 'import time;print(time.time())'; }
cd "$B/proto-correct-by-construction"
for cfg in tsconfig.json probes/tsconfig.json probes/tsconfig.reference.json probes/tsconfig.mistakes.json probes/tsconfig.components.json probes/tsconfig.helpers.json; do
  for T in $T5 $T7; do echo "$($T --version) $cfg errors=$($T -p $cfg --pretty false 2>&1 | grep -c 'error TS')"; done
done
pos() { $1 -p probes/tsconfig.mistakes.json --pretty false 2>&1 | grep -E '^probes/mistakes.ts\(' ; }
pos $T5 | grep -oE '^[^:]+' | sort > /tmp/st-m5.$$; pos $T7 | grep -oE '^[^:]+' | sort > /tmp/st-m7.$$
echo "mistake probe: positions 5.9.3=$(wc -l < /tmp/st-m5.$$ | tr -d ' ') 7.0.2=$(wc -l < /tmp/st-m7.$$ | tr -d ' ') differing=$(comm -3 /tmp/st-m5.$$ /tmp/st-m7.$$ | wc -l | tr -d ' ')"
echo "mistake probe: first line carries the fix (✗) 5.9.3=$(pos $T5 | grep -c '✗') 7.0.2=$(pos $T7 | grep -c '✗')"
pos $T5 | grep -oE '^[^:]+: error TS[0-9]+' | sort > /tmp/st-m5.$$; pos $T7 | grep -oE '^[^:]+: error TS[0-9]+' | sort > /tmp/st-m7.$$
echo "mistake probe: positions whose error code differs=$(comm -23 /tmp/st-m5.$$ /tmp/st-m7.$$ | wc -l | tr -d ' ')"
rm -f /tmp/st-m5.$$ /tmp/st-m7.$$
cd "$B/strict-tags/stress"
for T in $T5 $T7; do for i in 1 2 3; do s=$(now); n=$($T -p tsconfig.json --pretty false 2>&1 | grep -c 'error TS'); python3 -I -c "import time;print('$($T --version) stress 2000 errors=$n wall', round(time.time()-$s,2), 's')"; done; done
cd "$B/strict-tags-prd/probe"
for T in $T5 $T7; do echo "$($T --version) house-rule probe errors=$($T -p tsconfig.json --pretty false 2>&1 | grep -c 'error TS') (6 seeded)"; done
uptime
