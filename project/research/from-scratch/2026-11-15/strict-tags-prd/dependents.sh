#!/bin/sh
# package.json files under ~/jt-digital (depth 4) that name fluent-html as a dependency, the library's own repos left out.
cd /Users/tony/jt-digital
find . -maxdepth 4 -name package.json -not -path '*/node_modules/*' -not -path './projects-template-tests/*' -not -path './fluent-html/*' -not -path './fluent-html-eslint-plugin/*' -not -path './fluent-html-tailwind-extractor/*' 2>/dev/null | xargs grep -lE '"fluent-html" *:' 2>/dev/null | wc -l
