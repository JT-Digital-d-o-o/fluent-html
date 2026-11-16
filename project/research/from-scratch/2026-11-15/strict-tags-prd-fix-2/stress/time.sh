#!/bin/sh
# Check time as ratios that hold at any load. Both libraries and all three of the fleet's compilers in one script. Within a
# round the configs run one after the other (fluent-html 8, strict, fluent-html 8, …), so both sides of a ratio meet the same
# load. The reading is CPU seconds (user + sys), best of ROUNDS, and the ratio of two bests.
#   sh time.sh [ROUNDS] > time-<pass>.txt     then: sh agree.sh time-a.txt time-b.txt
cd "$(dirname "$0")"
R=${1:-3}
T5=/Users/tony/jt-digital/fluent-html/node_modules/.bin/tsc
T6=/Users/tony/jt-digital/everyframe-composer/node_modules/typescript/bin/tsc
T7=/Users/tony/jt-digital/everyframe-composer/node_modules/@typescript/native/bin/tsc
cpu() { /usr/bin/time -p $1 -p $2/tsconfig.json --pretty false > .out 2> .time; echo "$(awk '/^user/{u=$2} /^sys/{s=$2} END{print u+s}' .time) $(grep -c 'error TS' .out)"; }
group() { # compiler, then dir:label pairs; prints best cpu per dir
  T=$1; shift; V=$($T --version | sed 's/Version //')
  for p in "$@"; do eval "b_$(echo ${p%%:*} | tr -c 'a-z0-9\n' _)=999999"; done
  i=0; while [ $i -lt $R ]; do i=$((i+1))
    for p in "$@"; do d=${p%%:*}; k=$(echo $d | tr -c 'a-z0-9\n' _); r=$(cpu $T $d); c=${r% *}; e=${r#* }
      eval "b_$k=\$(echo \"$c \$b_$k\" | awk '{print (\$1<\$2)?\$1:\$2}'); e_$k=$e"; done
  done
  for p in "$@"; do d=${p%%:*}; k=$(echo $d | tr -c 'a-z0-9\n' _); eval "printf '%s\t%s\terrors=%s\tcpu=%s\n' \"$V\" \"${p#*:}\" \"\$e_$k\" \"\$b_$k\""; done
}
echo "start: $(uptime) cores=$(sysctl -n hw.ncpu) rounds=$R"
mkdir -p .lib && printf '{ "extends": "../../../strict-tags/tsconfig.json", "include": ["../../../strict-tags/lib/*.ts"] }\n' > .lib/tsconfig.json
python3 -I gen.py routes 65 138 379 364 rt-composer; python3 -I gen.py routes 1 1 1 1 rt-one
for N in 2000 11330; do
  python3 -I gen.py elements $N
  for T in $T5 $T6 $T7; do group $T "fh8:fh8 $N" "st:strict $N"; done
done
python3 -I gen.py elements 2000
for T in $T5 $T6 $T7; do group $T "fh8:fh8 2000 (routes reference)" "rt-composer:routes composer" "rt-one:routes one page" ".lib:strict library alone"; done
rm -rf .out .time .lib
echo "end: $(uptime)"
