#!/usr/bin/env bash
# Classify hk vs package archetype files after import-form canonicalisation.
# Prints per-file counts; AHEAD = hk-only non-blank lines beyond import noise.
set -u
W=~/Documents/dev/hk-crm/.worktrees/hk-crm-package-install-cutover
P="$W/node_modules/design-baseline"

canon() {
  # $1 file : strip stamps + blanks, canonicalise:
  #  - "@/components/ui"  "./" (package sibling form) or leave hk's "@/components/ui"
  #  - "@/lib/utils" and "../../lib/utils" and "../../../lib/utils" -> LIB()
  #  - "@/hooks|utils|components/layout" -> their pkg relative equivalents marked A
  #  - strip trailing semicolons on import lines only (noise)
  sed -E \
    -e '/design-baseline@/d' \
    -e 's#@/components/ui/#PUI/#g' \
    -e 's#^\s*import .* from ["'\'']\./#PUI/#' \
    -e 's#@/components/(ui|layout|archetypes)/#P\1/#g' \
    -e 's#(\.\./)+lib/utils#PLIB#g' \
    -e 's#@/lib/utils#PLIB#g' \
    -e 's#(\.\./)+hooks/#PHOOK/#g' -e 's#@/hooks/#PHOOK/#g' \
    -e 's#(\.\./)+utils/#PU/#g' -e 's#@/utils/#PU/#g' \
    -e 's#^import \{[^}]*\} .*$#\0#g' \
    "$1" | grep -vE '^[[:space:]]*$'
}

cd "$W"
while IFS= read -r f; do
  rel="src/components/archetypes/$f"
  pkg="$P/$rel"
  if [ ! -f "$pkg" ]; then echo "HK-ONLY  $f"; continue; fi
  a=$(canon "$rel"); b=$(canon "$pkg")
  if [ "$a" = "$b" ]; then echo "IDENTICAL $f"; continue; fi
  hk=$(diff <(printf '%s\n' "$b") <(printf '%s\n' "$a") | grep -c '^>')
  pk=$(diff <(printf '%s\n' "$b") <(printf '%s\n' "$a") | grep -c '^<')
  echo "DIFF hk+$hk pkg+$pk  $f"
done < <(cd src/components/archetypes && find . -type f \( -name '*.tsx' -o -name '*.ts' \) -print | sed 's|^\./||' | sort)
