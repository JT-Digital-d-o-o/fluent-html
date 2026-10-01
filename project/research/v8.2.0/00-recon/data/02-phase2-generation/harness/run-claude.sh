#!/bin/bash
# usage: run-claude.sh <cwd> <out-prefix> <prompt-file> [extra args...]
# env: SCRATCH (scratch dir holding wave0-2/), ORG_ROOT (dir holding the repo checkouts), CLAUDE_BIN (default: claude)
: "${SCRATCH:?set SCRATCH}" "${ORG_ROOT:?set ORG_ROOT}"
sed -e "s#\${ORG_ROOT}#$ORG_ROOT#g" -e "s#\${HOME}#$HOME#g" "$SCRATCH/wave0-2/settings.json" > "$SCRATCH/wave0-2/settings.rendered.json"
cwd="$1"; out="$2"; pf="$3"; shift 3
cd "$cwd" || exit 1
start=$(date +%s)
env -i $EXTRA_ENV HOME="$HOME" PATH="$PATH" USER="$USER" LOGNAME="$USER" LANG=en_US.UTF-8 TERM=xterm-256color SHELL=/bin/bash TMPDIR="$TMPDIR" \
  "${CLAUDE_BIN:-claude}" -p --restricted --settings "$SCRATCH/wave0-2/settings.rendered.json" \
  --disable-slash-commands --strict-mcp-config --no-session-persistence \
  --output-format stream-json --verbose "$@" < "$pf" > "$out.jsonl" 2> "$out.err"
rc=$?
end=$(date +%s)
echo "{\"rc\":$rc,\"wall_s\":$((end-start)),\"start\":$start,\"end\":$end}" > "$out.time.json"
