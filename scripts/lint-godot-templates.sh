#!/usr/bin/env bash
# Lint all Godot GDScript templates using gdtoolkit (gdparse).
# Substitutes {{TOKEN}} placeholders with dummy values before parsing,
# since gdparse can't handle raw template syntax.
#
# Usage: ./scripts/lint-godot-templates.sh
#
# Prerequisites: pip install gdtoolkit (or use project venv)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
TEMPLATE_DIR="$PROJECT_ROOT/server/services/game-export/godot/templates/scripts"
GDPARSE="${PROJECT_ROOT}/.venv-gdtoolkit/bin/gdparse"

# Fall back to system gdparse if venv doesn't exist
if [ ! -x "$GDPARSE" ]; then
  GDPARSE="$(command -v gdparse 2>/dev/null || true)"
  if [ -z "$GDPARSE" ]; then
    echo "ERROR: gdparse not found. Install gdtoolkit:"
    echo "  python3 -m venv .venv-gdtoolkit && .venv-gdtoolkit/bin/pip install gdtoolkit"
    exit 1
  fi
fi

TMPDIR=$(mktemp -d)
trap 'rm -rf "$TMPDIR"' EXIT

FAIL_COUNT=0
PASS_COUNT=0
SKIP_COUNT=0
TOTAL=0

# Find all .gd files
while IFS= read -r gd_file; do
  TOTAL=$((TOTAL + 1))
  rel_path="${gd_file#$TEMPLATE_DIR/}"

  # Replace {{TOKEN}} placeholders with dummy GDScript-valid values
  # Numbers: {{SOME_NUMBER}} → 1.0
  # Strings: {{SOME_STRING}} → "placeholder"
  sed_file="$TMPDIR/$(echo "$rel_path" | tr '/' '_')"
  sed \
    -e 's/{{[A-Z_]*COLOR_[RGB]}}/0.5/g' \
    -e 's/{{[A-Z_]*_R}}/0.5/g' \
    -e 's/{{[A-Z_]*_G}}/0.5/g' \
    -e 's/{{[A-Z_]*_B}}/0.5/g' \
    -e 's/{{[A-Z_]*ALPHA}}/0.7/g' \
    -e 's/{{[A-Z_]*SIZE}}/512/g' \
    -e 's/{{[A-Z_]*SCALE}}/1.0/g' \
    -e 's/{{[A-Z_]*WIDTH}}/6.0/g' \
    -e 's/{{[A-Z_]*HEIGHT}}/1.0/g' \
    -e 's/{{[A-Z_]*SPEED}}/1.0/g' \
    -e 's/{{[A-Z_]*GRAVITY}}/1.0/g' \
    -e 's/{{[A-Z_]*DAMAGE}}/10.0/g' \
    -e 's/{{[A-Z_]*CHANCE}}/0.1/g' \
    -e 's/{{[A-Z_]*MULTIPLIER}}/2.0/g' \
    -e 's/{{[A-Z_]*REDUCTION}}/0.5/g' \
    -e 's/{{[A-Z_]*COOLDOWN}}/1.0/g' \
    -e 's/{{[A-Z_]*ENERGY}}/100/g' \
    -e 's/{{[A-Z_]*GOLD}}/0/g' \
    -e 's/{{[A-Z_]*HEALTH}}/100/g' \
    -e 's/{{COMBAT_STYLE}}/base/g' \
    -e 's/{{GAME_TITLE}}/Insimul/g' \
    -e 's/{{INSIMUL_VERSION}}/1.0/g' \
    -e 's/{{WORLD_SAFE_NAME}}/World/g' \
    -e 's/{{WORLD_NAME}}/World/g' \
    -e 's/{{WORLD_TYPE}}/medieval/g' \
    -e 's/{{[A-Z_]*}}/1.0/g' \
    "$gd_file" > "$sed_file"

  # Check if any {{}} remain (unhandled tokens)
  if grep -q '{{' "$sed_file" 2>/dev/null; then
    remaining=$(grep -o '{{[^}]*}}' "$sed_file" | sort -u | head -5)
    echo "WARN: $rel_path — unhandled tokens: $remaining"
    SKIP_COUNT=$((SKIP_COUNT + 1))
    continue
  fi

  # Parse with gdparse
  output=$("$GDPARSE" "$sed_file" 2>&1) || {
    FAIL_COUNT=$((FAIL_COUNT + 1))
    echo "FAIL: $rel_path"
    echo "$output" | head -8 | sed 's|^|  |'
    continue
  }

  PASS_COUNT=$((PASS_COUNT + 1))
done < <(find "$TEMPLATE_DIR" -name "*.gd" -type f | sort)

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "GDScript template lint results:"
echo "  Total:   $TOTAL"
echo "  Passed:  $PASS_COUNT"
echo "  Failed:  $FAIL_COUNT"
echo "  Skipped: $SKIP_COUNT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$FAIL_COUNT" -gt 0 ]; then
  exit 1
fi
