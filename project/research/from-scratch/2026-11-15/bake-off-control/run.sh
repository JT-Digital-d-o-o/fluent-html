#!/usr/bin/env bash
# Usage: run.sh <trial-dir> <prompt.md> <transcript.jsonl>
# One headless session. Isolation as the stack-dsl harness (lib.mjs ISOLATION_ARGS + cleanEnv):
# no user settings, CLAUDE.md, MCP, skills or auto-memory. Edits auto-accepted, Bash allowed.
set -uo pipefail
dir="$1"; prompt="$(cat "$2")"; out="$3"
mkdir -p "$(dirname "$out")"
cd "$dir"
env $(env | grep -oE '^(CLAUDECODE|CLAUDE_CODE_[A-Z_]*|CLAUDE_PID|CLAUDE_AGENT_SDK[A-Z_]*|CLAUDE_EFFORT[A-Z_]*|AI_AGENT[A-Z_]*)=' | sed 's/=$//' | sed 's/^/-u /') \
  CLAUDE_CODE_DISABLE_AUTO_MEMORY=1 \
  claude -p "$prompt" --model claude-opus-5-5 --output-format stream-json --verbose --max-budget-usd 5 \
  --setting-sources project,local --strict-mcp-config --disable-slash-commands \
  --permission-mode acceptEdits --allowed-tools Bash --no-session-persistence \
  > "$out" 2> "$out.stderr" < /dev/null
echo "exit=$?" >> "$out.stderr"
