#!/bin/sh
# Per spelling: which rung refuses it. tsc on three compilers, then eslint with the strict config, then what the open ones render.
cd "$(dirname "$0")"
T5=/Users/tony/jt-digital/fluent-html/node_modules/.bin/tsc
T6=/Users/tony/jt-digital/everyframe-composer/node_modules/typescript/bin/tsc
T7=/Users/tony/jt-digital/everyframe-composer/node_modules/@typescript/native/bin/tsc
printf '{ "compilerOptions": { "strict": true, "noEmit": true, "target": "es2023", "module": "nodenext", "moduleResolution": "nodenext", "allowImportingTsExtensions": true, "skipLibCheck": true, "types": ["node"], "typeRoots": ["/Users/tony/jt-digital/fluent-html/node_modules/@types"] }, "include": ["*.ts"] }\n' > tsconfig.json
want() { grep -n "// ✗ $1" forge.ts | cut -d: -f1 | sort -u; }
for T in $T5 $T6 $T7; do
  $T -p tsconfig.json --pretty false > .raw 2>&1
  grep -oE '^forge\.ts\(([0-9]+)' .raw | cut -d'(' -f2 | sort -u > .got; want tsc > .want
  echo "tsc $($T --version | sed 's/Version //'): seeded $(wc -l < .want | tr -d ' '), missed [$(comm -23 .want .got | tr '\n' ' ')], also refused [$(comm -13 .want .got | tr '\n' ' ')], valid.ts errors $(grep -c '^valid.ts' .raw)"
done
/Users/tony/jt-digital/everyframe-composer/node_modules/.bin/eslint -c eslint.config.mjs --format json forge.ts valid.ts 2> .linterr | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{for(const f of JSON.parse(s))for(const m of f.messages)console.log(f.filePath.split("/").pop()+":"+m.line+":"+m.column+": "+(m.ruleId??"directive")+": "+m.message)})' > .lint; cat .linterr
grep -oE 'forge\.ts:([0-9]+)' .lint | cut -d: -f2 | sort -u > .got; want lint > .want
echo "eslint: seeded $(wc -l < .want | tr -d ' '), missed [$(comm -23 .want .got | tr '\n' ' ')], valid.ts reports $(grep -c '^valid\.ts:' .lint)"
grep -E 'forge\.ts:' .lint | sed -E 's#^.*/forge\.ts:#forge.ts:#' | cut -c1-150
echo "open (pass tsc and eslint): lines $(grep -n '// open' forge.ts | cut -d: -f1 | tr '\n' ' ')"
grep -n '// open' forge.ts | cut -d: -f1 | while read l; do grep -qE "forge\.ts:$l:" .lint && echo "  line $l is reported by eslint"; done
node forge.ts 2>&1 | grep -v -i 'warning\|--trace'
rm -f .raw .want .got .lint .linterr tsconfig.json
