#!/bin/bash
# usage: accept.sh <runDir> <runName> <port>
S=${SCRATCH:?set SCRATCH}/wave0-2
R=$1; name=$2; P=$3; O=$S/eval/$name; mkdir -p $O
cd $R
[ -f dev.db ] || npx prisma db push > $O/dbpush.txt 2>&1
npm run css > /dev/null 2>&1
APP_PORT=$P BASE_URL=http://localhost:$P npx tsx src/index.ts > $O/server.log 2>&1 &
SP=$!
for i in $(seq 1 60); do curl -s -o /dev/null -w "%{http_code}" http://localhost:$P/health 2>/dev/null | grep -q 200 && break; sleep 1; done
DUMP=$O/team.html node $S/pw/accept.cjs http://localhost:$P $name > $O/accept.json 2> $O/accept.err
kill $SP 2>/dev/null; sleep 1; pkill -P $SP 2>/dev/null
python3 -c "
import json; d=json.load(open('$O/accept.json')); print(d['run'], d['passed'],'/',d['total'])
for r in d['results']: print('  ', 'PASS' if r['ok'] else 'FAIL', r['id'], '|', r['detail'][:180])"
