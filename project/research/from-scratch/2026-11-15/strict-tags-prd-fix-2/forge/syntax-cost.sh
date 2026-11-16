#!/bin/sh
# What the syntax ban would touch today: type predicates, overload signatures and ambient values in the census apps'
# files that import fluent-html (the files a strict config would cover after they move).
cd /Users/tony/jt-digital
for app in fl-um fluent-html-home-page studio everyframe competify gzs/stem-50 home-page everyframe-composer; do
  files=$(grep -rlE "from ['\"]fluent-html['\"]" $app/src --include='*.ts' 2>/dev/null)
  n=$(echo "$files" | grep -c .)
  pred=$(echo "$files" | xargs grep -hE '\)\s*:\s*(asserts\s+)?[A-Za-z_]+\s+is\s+[A-Za-z_<{("]' 2>/dev/null | grep -c .)
  decl=$(echo "$files" | xargs grep -hE '^\s*(export\s+)?declare\s+(const|function|class)\b' 2>/dev/null | grep -c .)
  aug=$(echo "$files" | xargs grep -hE '^\s*(export\s+)?declare\s+(module|global)\b' 2>/dev/null | grep -c .)
  over=$(echo "$files" | xargs grep -hE '^\s*(export\s+)?(async\s+)?function\s+[A-Za-z_]+\s*(<[^>]*>)?\([^)]*\)\s*:\s*[^{]+;\s*$' 2>/dev/null | grep -c .)
  printf '%s\tfiles=%s\tpredicates=%s\toverloads=%s\tambient values=%s\tmodule augmentations (not banned)=%s\n' $app $n $pred $over $decl $aug
done
