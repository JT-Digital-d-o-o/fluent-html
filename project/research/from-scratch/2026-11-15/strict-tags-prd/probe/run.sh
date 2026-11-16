#!/bin/sh
# Prints tsc's errors, then the "✗" lines without an error and the error lines without a "✗".
cd "$(dirname "$0")"
TSC=${TSC:-/Users/tony/jt-digital/fluent-html/node_modules/.bin/tsc}
$TSC -p tsconfig.json --pretty false > out.txt; echo "tsc_exit=$?" >> out.txt
grep -n '// ✗' house-rule.ts | cut -d: -f1 | sort -u > .want
grep -oE '^house-rule\.ts\(([0-9]+)' out.txt | cut -d'(' -f2 | sort -u > .got
echo "seeded=$(wc -l < .want | tr -d ' ') error_lines=$(wc -l < .got | tr -d ' ') missed=$(comm -23 .want .got | tr '\n' ' ') stray=$(comm -13 .want .got | tr '\n' ' ')" >> out.txt
rm -f .want .got; cat out.txt
