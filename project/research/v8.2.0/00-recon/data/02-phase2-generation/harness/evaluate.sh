#!/bin/bash
# usage: evaluate.sh <run-name>
S=${SCRATCH:?set SCRATCH}/wave0-2
r=$1; R=$S/runs/$r; O=$S/eval/$r; mkdir -p $O
cd $R
git status --porcelain --untracked-files=all -- . ':!.ai' ':!CLAUDE.md' > $O/status.txt
git diff --stat > $O/diffstat.txt
git ls-files --others --exclude-standard -- src tests prisma | xargs wc -l > $O/new-loc.txt 2>/dev/null
git diff --numstat > $O/numstat.txt
npx tsc -p tsconfig.json --noEmit --pretty false > $O/tsc.txt 2>&1; echo "tsc_rc=$?" > $O/rc.txt
npx eslint . -f json > $O/eslint.json 2> $O/eslint.err; echo "eslint_rc=$?" >> $O/rc.txt
npm run css > $O/css.txt 2>&1; echo "css_rc=$?" >> $O/rc.txt
git checkout -q -- public/css 2>/dev/null
