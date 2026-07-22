#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# Nexos — TypeScript fix script, round 3
# Confirmed fix: reminderInput/setReminderInput state was used
# but never declared in task-manager.tsx. Inserts it near the
# other state declarations (settingReminderId, editingId, etc).
#
# command-palette.tsx (line 108, Habit field mismatch) is NOT
# included here — still waiting on the actual Habit interface
# fields before patching that one, to avoid another blind guess.
# ============================================================

FRONTEND="frontend/nexus-dashboard"
SRC="$FRONTEND/src"
TASK_MANAGER="$SRC/components/task-manager.tsx"

if [ ! -f "$TASK_MANAGER" ]; then
  echo "[missing] $TASK_MANAGER not found — run this from the repo root."
  exit 1
fi

mkdir -p .fix-backups
cp "$TASK_MANAGER" ".fix-backups/task-manager.tsx.bak3"
echo "Backed up task-manager.tsx before round 3 edit."
echo ""

NEW_STATE_LINE='  const [reminderInput, setReminderInput] = useState<string>("")'

if grep -q "const \[reminderInput, setReminderInput\]" "$TASK_MANAGER"; then
  echo "[skip] reminderInput state already declared — no change made."
else
  # Prefer inserting right after settingReminderId's declaration, since
  # saveReminder() uses both together — keeps related state grouped.
  ANCHOR_LINE=$(grep -n "settingReminderId" "$TASK_MANAGER" | grep -i "useState" | head -1 | cut -d: -f1 || true)

  # Fallback: insert after the last useState in the file if that anchor isn't found.
  if [ -z "${ANCHOR_LINE:-}" ]; then
    ANCHOR_LINE=$(grep -n "useState" "$TASK_MANAGER" | tail -1 | cut -d: -f1 || true)
  fi

  if [ -n "${ANCHOR_LINE:-}" ]; then
    awk -v n="$ANCHOR_LINE" -v ins="$NEW_STATE_LINE" \
      'NR==n{print; print ins; next} {print}' "$TASK_MANAGER" > "$TASK_MANAGER.tmp" \
      && mv "$TASK_MANAGER.tmp" "$TASK_MANAGER"
    echo "[fixed] Inserted reminderInput state after line $ANCHOR_LINE."
    echo "        >>> Quick sanity check: confirm it's inside the component, near the other useState calls. <<<"
  else
    echo "[manual] No useState anchor found at all — add this line yourself near your other state:"
    echo "  $NEW_STATE_LINE"
  fi
fi

echo ""
echo "== Re-run: pnpm run typecheck =="
echo "Should now only show the command-palette.tsx Habit field error —"
echo "paste back the Habit interface (lines 1-20 of habits-context.tsx)"
echo "and that's the last one, precisely fixed."
