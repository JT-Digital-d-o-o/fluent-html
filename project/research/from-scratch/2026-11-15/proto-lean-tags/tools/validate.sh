#!/bin/sh
# html-validate (recommended preset) on every rendered file of both arms; one line per file, then totals.
#   sh tools/validate.sh > out/html-validate.txt
cd "$(dirname "$0")/.."
HV="npx -y html-validate@11.17.0"
echo "# $($HV --version) config: $(cat .htmlvalidate.json | tr -d '\n')"
for arm in lean-tags fh8; do
  dir=out; [ $arm = fh8 ] && dir=out/fh8
  total=0
  for f in $dir/*.html; do
    n=$($HV --config .htmlvalidate.json -f json "$f" 2>/dev/null | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const r=JSON.parse(s||"[]");console.log(r.reduce((a,x)=>a+x.errorCount,0))})')
    rules=$($HV --config .htmlvalidate.json -f json "$f" 2>/dev/null | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const r=JSON.parse(s||"[]");const c={};for(const x of r)for(const m of x.messages)c[m.ruleId]=(c[m.ruleId]||0)+1;console.log(Object.entries(c).map(([k,v])=>k+"x"+v).join(" "))})')
    echo "$arm $(basename $f) errors=$n $rules"
    total=$((total + n))
  done
  echo "$arm TOTAL errors=$total"
done
