#!/bin/sh
# Per fleet app: the swaps the house rule touches. Fragment routes (render: an id) by method, and targeted verb calls.
cd /Users/tony/jt-digital
printf 'app\tfragment-routes\tof-which-mutations\tfragment()\tsearch()\tonChange()\tpoll()\tdefer()\tfire()\tPartial(\n'
T="0 0 0 0 0 0 0 0 0"
for a in competify studio everyframe everyframe-composer home-page fluent-html-home-page fl-um gzs/stem-50; do
  c() { grep -rhoE "$1" "$a/src" --include='*.ts' 2>/dev/null | wc -l | tr -d ' '; }
  fr=$(grep -rhE 'render: *[A-Za-z]*[iI]ds\.' "$a/src" --include='*.routes.ts' 2>/dev/null | wc -l | tr -d ' ')
  fm=$(grep -rhE 'render: *[A-Za-z]*[iI]ds\.' "$a/src" --include='*.routes.ts' 2>/dev/null | grep -cE 'method: *"(post|put|patch|delete)"')
  row="$fr $fm $(c '\.fragment\(') $(c '\.search\((ids|[a-zA-Z]*Ids)\.') $(c '\.onChange\(') $(c '\.poll\(') $(c '\.defer\(') $(c '\.fire\(') $(c '\bPartial\(')"
  printf '%s' "$a"; for v in $row; do printf '\t%s' "$v"; done; printf '\n'
  T=$(echo "$T $row" | awk '{for(i=1;i<=9;i++) printf "%d ", $i+$(i+9)}')
done
printf 'total'; for v in $T; do printf '\t%s' "$v"; done; printf '\n'
