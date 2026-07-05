#!/bin/bash
# Warn when a git commit touches files referenced by a backlog item (either
# docs/backlog/*.md or docs/backlog/wip/*.md) that is not being moved to
# docs/backlog/archive/ in the same commit. ALSO warns if any open/wip
# ticket already contains a "Shipped YYYY-MM-DD" marker — that means an
# earlier commit shipped the work without archiving.
# Non-blocking: emits a systemMessage hint via stdout, then exits 0.

set -e

input=$(cat)
command=$(echo "$input" | jq -r '.tool_input.command // empty')

# Only act on `git commit` invocations (including chained commands).
if ! echo "$command" | grep -qE '(^|[[:space:];&|])git[[:space:]]+commit([[:space:]]|$)'; then
  exit 0
fi

repo_root=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0
cd "$repo_root"

backlog_dir="docs/backlog"
[ -d "$backlog_dir" ] || exit 0

# --- Pass 1: scan all open/wip tickets for "Shipped" markers. -------------
shipped_hits=$(grep -ElR '(\bShipped[[:space:]]+[0-9]{4}-[0-9]{2}-[0-9]{2}\b|PR #[0-9]+ merged)' \
  "$backlog_dir"/*.md "$backlog_dir"/wip/*.md 2>/dev/null | sort -u || true)

if [ -n "$shipped_hits" ]; then
  shipped_lines=$(echo "$shipped_hits" | awk '{print "  - " $0}')
  shipped_msg=$(printf 'Backlog archive reminder: these open/wip tickets contain a "Shipped …" marker — they likely belong in docs/backlog/archive/:\n%s\n\nIf the work really did ship, run `git mv <path> docs/backlog/archive/` and re-stage before committing.' "$shipped_lines")
  jq -nc --arg m "$shipped_msg" '{systemMessage: $m}'
fi

# --- Pass 2: staged code/source files referenced by open/wip tickets. -----
# "Source-ish" = anything outside docs/, tasks/, .claude/, .github/. Tweak per project if too broad.
staged=$(git diff --cached --name-only --diff-filter=AMR 2>/dev/null \
  | grep -Ev '^(docs|tasks|\.claude|\.github)/' || true)
[ -z "$staged" ] && exit 0

# Backlog items being moved to archive this commit (rename detection).
moved=$(git diff --cached --name-status --diff-filter=R 2>/dev/null \
  | awk -v base="$backlog_dir/" -v arch="$backlog_dir/archive/" \
      '$1 ~ /^R/ { if ($2 ~ "^"base && $3 ~ "^"arch) print $2 }' \
  || true)

pairs=""
while IFS= read -r sf; do
  [ -z "$sf" ] && continue
  while IFS= read -r hit; do
    [ -z "$hit" ] && continue
    case "$hit" in "$backlog_dir"/archive/*) continue ;; esac
    if [ -n "$moved" ] && echo "$moved" | grep -qxF "$hit"; then continue; fi
    pairs="${pairs}${hit}|${sf}
"
  done < <(grep -lF "$sf" "$backlog_dir"/*.md "$backlog_dir"/wip/*.md 2>/dev/null || true)
done <<< "$staged"

[ -z "$pairs" ] && exit 0

lines=$(printf '%s' "$pairs" | awk -F'|' 'NF==2 && !seen[$1]++ {print "  - " $1 " (references " $2 ")"}')
msg=$(printf 'Backlog archive reminder: this commit touches files referenced by backlog items still open or in wip:\n%s\n\nIf this work completes any of them, run `git mv <path> docs/backlog/archive/` and re-stage before committing. If it does not, commit as-is.' "$lines")

jq -nc --arg m "$msg" '{systemMessage: $m}'
exit 0
