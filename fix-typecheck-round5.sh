#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# Nexos — TypeScript fix script, round 5
# The Habit type requires targetFrequency: 'daily' | 'weekly' | 'custom'
# with no default. The quick-add addHabit() call in command-palette.tsx
# never supplied one. Defaulting to "daily" for a quick-add action —
# revisit if you want the command palette to open a fuller habit form
# instead of quick-adding with an assumed frequency.
# ============================================================

FRONTEND="frontend/nexus-dashboard"
SRC="$FRONTEND/src"
CMD_PALETTE="$SRC/components/command-palette.tsx"

if [ ! -f "$CMD_PALETTE" ]; then
  echo "[missing] $CMD_PALETTE not found — run this from the repo root."
  exit 1
fi

mkdir -p .fix-backups
cp "$CMD_PALETTE" ".fix-backups/command-palette.tsx.bak5"
echo "Backed up command-palette.tsx before round 5 edit."
echo ""

if grep -q "targetFrequency:" "$CMD_PALETTE"; then
  echo "[skip] targetFrequency already present somewhere in the file — check manually."
else
  # Insert right after the 'color: "blue",' line inside the addHabit() literal,
  # matching whatever indentation that line already has.
  if grep -qE '^[[:space:]]*color: "blue",[[:space:]]*$' "$CMD_PALETTE"; then
    sed -i -E 's/^([[:space:]]*)color: "blue",[[:space:]]*$/\1color: "blue",\n\1targetFrequency: "daily",/' "$CMD_PALETTE"
    echo "[fixed] Added targetFrequency: \"daily\", after color: \"blue\","
  else
    echo "[not found] Couldn't find the expected 'color: \"blue\",' line — check manually around addHabit() in $CMD_PALETTE."
  fi
fi

echo ""
echo "== Re-run: pnpm run typecheck =="
echo "This should now be fully clean across all 4 workspace projects."
