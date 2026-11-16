#!/bin/sh
# How much of the bake-off task (S1 settings form, S2 orders table) each arm's reference carries, and how much
# of it each session's source reuses.   sh refs.sh <scratchpad>
B=$(cd "$(dirname "$0")/.." && pwd); T="$1/fs-trial2"
for f in proto-fluent-nine/pkg/REFERENCE.md proto-correct-by-construction/REFERENCE.md proto-page-parts/REFERENCE.md; do
  printf '%s (%s B):' "$f" "$(wc -c < "$B/$f" | tr -d ' ')"
  for p in orders settings timezone displayName 'sort' 'No orders match'; do printf ' %s=%s' "$p" "$(grep -ci "$p" "$B/$f")"; done; echo
done
for r in fluent-nine-r1 fluent-nine-r2; do printf '%s src:' "$r"
  for p in SettingsReq orderRoutes order-table settings-form 'No orders match'; do printf ' %s=%s' "$p" "$(grep -rhoF "$p" "$T/$r/src" | wc -l | tr -d ' ')"; done; echo; done
for r in correct-by-construction-r1 correct-by-construction-r2; do printf '%s src:' "$r"
  for p in 'orders.table' 'change("status")' '.load()'; do printf ' %s=%s' "$p" "$(grep -rhoF "$p" "$T/$r/src" | wc -l | tr -d ' ')"; done; echo; done
