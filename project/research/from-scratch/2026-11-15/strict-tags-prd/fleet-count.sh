#!/bin/sh
# Per fleet app: files importing fluent-html, their lines, route entries, verb calls, hatch calls.
cd /Users/tony/jt-digital
printf 'app\tfiles\tlines\troute-files\tctrl-files\tverb-calls\thatch-calls\tRaw\n'
tf=0; tl=0; tv=0; th=0; tr=0; tc=0; traw=0
for a in competify studio website-sales-funnel-automation-system everyframe everyframe-composer home-page fluent-html-home-page fl-um gzs/stem-50; do
  [ -d "$a/src" ] || { printf '%s\tMISSING\n' "$a"; continue; }
  files=$(grep -rlE "from ['\"]fluent-html['\"/]" "$a/src" --include='*.ts' 2>/dev/null | wc -l | tr -d ' ')
  lines=$(grep -rlE "from ['\"]fluent-html['\"/]" "$a/src" --include='*.ts' 2>/dev/null | tr '\n' '\0' | xargs -0 cat 2>/dev/null | wc -l | tr -d ' ')
  rf=$(find "$a/src" -name '*.routes.ts' | wc -l | tr -d ' ')
  cf=$(find "$a/src" -name '*.controller.ts' | wc -l | tr -d ' ')
  verbs=$(grep -rhoE '\.(nav|tab|submit|fragment|search|onChange|poll|defer|fire)\(' "$a/src" --include='*.ts' 2>/dev/null | wc -l | tr -d ' ')
  hatch=$(grep -rhoE '\.setHtmx\(|\bhx\(' "$a/src" --include='*.ts' 2>/dev/null | wc -l | tr -d ' ')
  raw=$(grep -rhoE '\bRaw\(' "$a/src" --include='*.ts' 2>/dev/null | wc -l | tr -d ' ')
  printf '%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\n' "$a" "$files" "$lines" "$rf" "$cf" "$verbs" "$hatch" "$raw"
  tf=$((tf+files)); tl=$((tl+lines)); tv=$((tv+verbs)); th=$((th+hatch)); tr=$((tr+rf)); tc=$((tc+cf)); traw=$((traw+raw))
done
printf 'total\t%s\t%s\t%s\t%s\t%s\t%s\t%s\n' "$tf" "$tl" "$tr" "$tc" "$tv" "$th" "$traw"
