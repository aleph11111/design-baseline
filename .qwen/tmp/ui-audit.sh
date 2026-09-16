#!/usr/bin/env bash
# Audit: for each staged ui/ deletion, classify hk's HEAD copy vs the package
# v0.2.1 copy after normalisation (strip vendor-stamp line + blank lines;
# canonicalise import forms). IDENTICAL / BEHIND = safe to delete; AHEAD-ish
# (only hk lines, or hk-only content) = potential fork, inspect.
set -u
W=~/Documents/dev/hk-crm/.worktrees/hk-crm-package-install-cutover
P="$W/node_modules/design-baseline"

norm() {
  # $1 = raw file text : strip stamp lines, canonicalise import sources, drop
  # blank lines. Relative sibling imports (./x or ../x) are left as-is on both
  # sides, except ./foo -> FOO, since both trees are one-directory siblings of
  # the ui dir and use the same relative name.
  printf '%s\n' "$1" | grep -v 'design-baseline@' | sed \
    -e 's#@/components/ui/#UI/#g' \
    -e 's#@/components/#C/#g' \
    -e 's#@/lib/ utils#x#g' \
    -e 's#@/lib/utils#L(/)#g' \
    -e 's#@/hooks/#H(#g' \
    -e 's#@/utils/#U(#g' \
    -e 's#^\s*import .* from ["'\'']\(\.\)/\([a-zA-Z.]*\).*$#import ./\2#g' \
    | grep -v '^[[:space:]]*$'
}

git -C "$W" diff --cached --name-only --diff-filter=D -- 'src/components/ui/' | while read -r rel; do
  hkhead=$(git -C "$W" show "HEAD:$rel" 2>/dev/null)
  if [ -z "$hkhead" ]; then echo "NO-HEAD-COPY (untracked?) $rel"; continue; fi
  pkgfile="$P/$rel"
  if [ ! -f "$pkgfile" ]; then echo "PKG-DIFFERENT-PATH  $rel"; continue; fi
  a=$(norm "$hkhead")
  b=$(norm "$(cat "$pkgfile")")
  if [ "$a" = "$b" ]; then
    echo "IDENTICAL      $rel"
  else
    hkonly=$(diff <(printf '%s' "$b") <(printf '%s' "$a") | grep -c '^>')
    pkgonly=$(diff <(printf '%s' "$b") <(printf '%s' "$a") | grep -c '^<')
    echo "DIFF(hk+${hkonly}/pkg+${pkgonly}) $rel"
  fi
done
