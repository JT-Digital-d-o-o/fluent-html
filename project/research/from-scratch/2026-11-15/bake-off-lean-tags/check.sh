#!/usr/bin/env bash
# Usage: check.sh <trial-dir> <html-validate bin>
# The control's check.sh (tsc, a fresh render, html-validate recommended per screen), then this arm's
# documented class check, which the reference tells the session to run beside tsc.
dir="$1"; hv="$2"; here="$(cd "$(dirname "$0")" && pwd)"
bash "$here/../bake-off-control/check.sh" "$dir" "$hv"
cd "$dir"; echo "\$ npx lean-tags-check src/theme.css src"; npx lean-tags-check src/theme.css src; echo "check_exit=$?"
