#!/bin/sh
# Source size of the three screens, whitespace collapsed (the screening's uniform measure), for
# Strict Tags, Lean Tags and the fluent-html 8 versions Lean Tags wrote of the same screens.
#   sh tools/sizes.sh
cd "$(dirname "$0")/../.."
size() { total=0; for f in "$@"; do n=$(tr -s ' \t\n' ' ' < "$f" | wc -c); total=$((total + n)); done; echo $total; }
views() { find "$1" -path '*views*' -name '*.ts' | sort; }
all() { find "$1" -name '*.ts' | sort; }
for arm in "strict-tags strict-tags/screens" "lean-tags token-economy/screens/lt" "fluent-html-8 token-economy/screens/fh8"; do
  set -- $arm
  echo "$1 views=$(size $(views $2)) B whole-feature=$(size $(all $2)) B files=$(all $2 | wc -l | tr -d ' ')"
done
