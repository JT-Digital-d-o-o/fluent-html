#!/bin/sh
# The ref each dependent's package.json gives fluent-html (same file set as strict-tags-prd/dependents.sh).
cd /Users/tony/jt-digital
find . -maxdepth 4 -name package.json -not -path '*/node_modules/*' -not -path './projects-template-tests/*' -not -path './fluent-html/*' -not -path './fluent-html-eslint-plugin/*' -not -path './fluent-html-tailwind-extractor/*' 2>/dev/null \
  | xargs grep -hE '"fluent-html" *:' 2>/dev/null | sed -E 's/.*"fluent-html" *: *"([^"]*)".*/\1/' | sed -E 's/#[0-9a-f]{7,40}$/#<sha>/' | sort | uniq -c | sort -rn
for a in competify studio everyframe everyframe-composer home-page fluent-html-home-page fl-um gzs/stem-50 projects-template/templates/full-stack; do
  printf '%s\t%s\n' "$a" "$(grep -hE '"fluent-html" *:' $a/package.json | sed -E 's/.*: *"([^"]*)".*/\1/')"
done
