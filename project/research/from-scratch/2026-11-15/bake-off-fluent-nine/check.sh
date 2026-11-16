#!/usr/bin/env bash
# Usage: check.sh <trial-dir> <html-validate bin>
# The control's check.sh unchanged: tsc, a fresh render, html-validate (recommended) per screen.
here="$(cd "$(dirname "$0")" && pwd)"
bash "$here/../bake-off-control/check.sh" "$@"
