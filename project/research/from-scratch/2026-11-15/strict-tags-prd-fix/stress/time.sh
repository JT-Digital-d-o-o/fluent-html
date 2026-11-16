#!/bin/sh
# Check time for both libraries in one script, on both compilers: wall and CPU (user + sys) seconds, best of 3.
# Elements at 2,000 and at everyframe-composer's count of tag calls (11,330); the route table at its size
# (65 files, 138 pages, 379 parts, 364 actions).   sh time.sh > time.txt
cd "$(dirname "$0")"
T5=/Users/tony/jt-digital/fluent-html/node_modules/.bin/tsc
T7=/Users/tony/jt-digital/everyframe-composer/node_modules/@typescript/native/bin/tsc
one() { # compiler, dir, label
  best_w=999999; best_c=999999; errs=0
  for i in 1 2 3; do
    /usr/bin/time -p $1 -p $2/tsconfig.json --pretty false > .out 2> .time; 
    errs=$(grep -c 'error TS' .out)
    w=$(awk '/^real/{print $2}' .time); c=$(awk '/^user/{u=$2} /^sys/{s=$2} END{print u+s}' .time)
    best_w=$(echo "$w $best_w" | awk '{print ($1<$2)?$1:$2}'); best_c=$(echo "$c $best_c" | awk '{print ($1<$2)?$1:$2}')
  done
  printf '%s\t%s\terrors=%s\twall=%s\tcpu=%s\n' "$($1 --version)" "$3" "$errs" "$best_w" "$best_c"
}
echo "start: $(uptime)"
for N in 2000 11330; do
  python3 -I gen.py elements $N
  for T in $T5 $T7; do one $T fh8 "fluent-html 8.1.0, $N elements"; one $T st "strict-tags, $N elements"; done
done
cat > .lib.json <<'J'
{ "extends": "../../strict-tags/tsconfig.json", "include": ["../../strict-tags/lib/*.ts"] }
J
mkdir -p .lib && mv .lib.json .lib/tsconfig.json && sed -i '' 's#"\.\./\.\./strict-tags#"../../../strict-tags#g' .lib/tsconfig.json
for T in $T5 $T7; do one $T .lib "strict-tags, library alone"; done
python3 -I gen.py routes 65 138 379 364
for T in $T5 $T7; do one $T rt "route and handler tables, 65 files, 138 pages, 379 parts, 364 actions"; done
python3 -I gen.py routes 1 1 1 1
for T in $T5 $T7; do one $T rt "route and handler tables, 1 page"; done
python3 -I gen.py routes 65 138 379 364; python3 -I gen.py elements 2000
rm -rf .out .time .lib
echo "end: $(uptime)"
