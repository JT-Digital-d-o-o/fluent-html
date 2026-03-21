#!/usr/bin/env bash
# ─── Guidelines management ────────────────────────────────────────────────
#
# Usage:
#   scripts/guidelines.sh check   — check if local guidelines are up to date
#   scripts/guidelines.sh pull    — pull latest guidelines and update root CLAUDE.md

set -euo pipefail

REPO="git@github.com:JT-Digital-d-o-o/guidelines.git"
AI_DIR=".ai"
VERSION_FILE="${AI_DIR}/.guidelines-version"
CLAUDE_MD_SRC="${AI_DIR}/web-development/CLAUDE.md"

# ─── Colors ───────────────────────────────────────────────────────────────

GREEN="\033[0;32m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
CYAN="\033[0;36m"
BOLD="\033[1m"
DIM="\033[2m"
RESET="\033[0m"

info()    { echo -e "${CYAN}${BOLD}>>>${RESET} $1"; }
success() { echo -e "${GREEN}${BOLD} ✔ ${RESET} $1"; }
warn()    { echo -e "${YELLOW}${BOLD} ! ${RESET} $1"; }
error()   { echo -e "${RED}${BOLD} ✖ ${RESET} $1"; exit 1; }

# ─── Helpers ──────────────────────────────────────────────────────────────

get_local_hash() {
  if [ -f "$VERSION_FILE" ]; then
    cat "$VERSION_FILE" | tr -d '[:space:]'
  else
    echo ""
  fi
}

get_remote_hash() {
  git ls-remote "$REPO" HEAD 2>/dev/null | cut -f1
}

# ─── Commands ─────────────────────────────────────────────────────────────

cmd_check() {
  info "Checking guidelines status..."

  local local_hash remote_hash
  local_hash=$(get_local_hash)
  remote_hash=$(get_remote_hash)

  if [ -z "$local_hash" ]; then
    error "No ${VERSION_FILE} found. Run ${BOLD}npm run guidelines:pull${RESET} first."
  fi

  if [ -z "$remote_hash" ]; then
    error "Could not reach remote repository."
  fi

  echo -e "  Local:  ${DIM}${local_hash:0:12}${RESET}"
  echo -e "  Remote: ${DIM}${remote_hash:0:12}${RESET}"

  if [ "$local_hash" = "$remote_hash" ]; then
    success "Guidelines are up to date."
  else
    warn "Guidelines are outdated. Run ${BOLD}npm run guidelines:pull${RESET} to update."
    exit 1
  fi
}

cmd_pull() {
  info "Pulling latest guidelines..."

  local remote_hash
  remote_hash=$(get_remote_hash)

  if [ -z "$remote_hash" ]; then
    error "Could not reach remote repository."
  fi

  # Clone into temp dir, copy files over
  local tmp_dir
  tmp_dir=$(mktemp -d)

  git clone --depth 1 --quiet "$REPO" "$tmp_dir/guidelines" 2>/dev/null

  # Preserve .guidelines-version during the copy
  rm -rf "${AI_DIR:?}/"
  cp -R "$tmp_dir/guidelines/" "$AI_DIR/"
  rm -rf "$AI_DIR/.git"

  # Clean up temp dir
  rm -rf "$tmp_dir"

  # Write version hash
  echo "$remote_hash" > "$VERSION_FILE"

  success "Guidelines updated to ${DIM}${remote_hash:0:12}${RESET}"

  # Copy web-development CLAUDE.md to project root
  if [ -f "$CLAUDE_MD_SRC" ]; then
    cp "$CLAUDE_MD_SRC" "CLAUDE.md"
    success "CLAUDE.md updated in project root."
  else
    warn "Could not find ${CLAUDE_MD_SRC} — CLAUDE.md not updated."
  fi
}

# ─── Main ─────────────────────────────────────────────────────────────────

case "${1:-}" in
  check) cmd_check ;;
  pull)  cmd_pull ;;
  *)
    echo "Usage: $0 {check|pull}"
    echo ""
    echo "  check   Check if local guidelines match the latest remote version"
    echo "  pull    Pull latest guidelines and update root CLAUDE.md"
    exit 1
    ;;
esac
