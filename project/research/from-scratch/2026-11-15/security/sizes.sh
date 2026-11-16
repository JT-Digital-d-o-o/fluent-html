#!/bin/sh
# Source size of the three screens in each design: bytes, and bytes with runs of whitespace collapsed.
cd "$(dirname "$0")"
row() { printf "%-34s %6s B  %6s B squashed  %4s lines\n" "$1" "$(cat $2 | wc -c | tr -d ' ')" "$(cat $2 | tr -s ' \n\t' ' ' | wc -c | tr -d ' ')" "$(cat $2 | wc -l | tr -d ' ')"; }
row "sealed r1" screens/r1-project-list.tsx;   row "fh8    r1" screens-fh8/r1-project-list.ts
row "sealed r2" screens/r2-project-form.tsx;   row "fh8    r2" screens-fh8/r2-project-form.ts
row "sealed r3" screens/r3-project-detail.tsx; row "fh8    r3" screens-fh8/r3-project-detail.ts
row "sealed routes" screens/projects.routes.ts; row "fh8    routes+schema" "screens-fh8/projects.routes.ts screens-fh8/projects.schema.ts"
row "sealed r1+r2+r3" "screens/r1-project-list.tsx screens/r2-project-form.tsx screens/r3-project-detail.tsx"
row "fh8    r1+r2+r3" "screens-fh8/r1-project-list.ts screens-fh8/r2-project-form.ts screens-fh8/r3-project-detail.ts"
