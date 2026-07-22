#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# Nexos — TypeScript fix script, round 4 (final)
# Confirmed against the real Habit interface in habits-context.tsx:
#   id, name, category?, targetFrequency, createdAt, color?,
#   reminderAt?, notifiedToday?
# There is no 'icon' field. The addHabit() call in command-palette.tsx
# passes one anyway — this is a straight deletion, not a rename.
# ============================================================

FRONTEND="frontend/nexus-dashboard"
SRC="$FRONTEND/src"
CMD_PALETTE="$SRC/components/command-palette.tsx"

if [ ! -f "$CMD_PALETTE" ]; then
  echo "[missing] $CMD_PALETTE not found — run this from the repo root."
  exit 1
fi

mkdir -p .fix-backups
cp "$CMD_PALETTE" ".fix-backups/command-palette.tsx.bak4"
echo "Backed up command-palette.tsx before round 4 edit."
echo ""

if grep -qE '^[[:space:]]*icon: "✨",[[:space:]]*$' "$CMD_PALETTE"; then
  sed -i -E '/^[[:space:]]*icon: "✨",[[:space:]]*$/d' "$CMD_PALETTE"
  echo "[fixed] Removed the invalid 'icon: \"✨\",' line from the addHabit() call."
else
  echo "[not found] Couldn't find that exact icon line — check manually around addHabit() in $CMD_PALETTE."
fi

echo ""
echo "== Re-run: pnpm run typecheck =="
echo "This should now be fully clean across all 4 workspace projects."
