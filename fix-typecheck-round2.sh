#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# Nexos — TypeScript fix script, round 2
# Applies two CONFIRMED patches based on real source seen in
# round 1's output. Still won't touch the two unresolved items
# (Habit type field name, task-manager reminderInput site) —
# those need one more grep, printed at the bottom.
# ============================================================

FRONTEND="frontend/nexus-dashboard"
SRC="$FRONTEND/src"

if [ ! -d "$SRC" ]; then
  echo "Can't find $SRC — run this from the repo root."
  exit 1
fi

CMD_PALETTE="$SRC/components/command-palette.tsx"
PAIRING_MODAL="$SRC/components/pairing-modal.tsx"
TASK_MANAGER="$SRC/components/task-manager.tsx"

mkdir -p .fix-backups
cp "$CMD_PALETTE" ".fix-backups/command-palette.tsx.bak2" 2>/dev/null || true
cp "$PAIRING_MODAL" ".fix-backups/pairing-modal.tsx.bak2" 2>/dev/null || true
echo "Backed up before round 2 edits."
echo ""

# ------------------------------------------------------------
# FIX: command-palette.tsx — add 'completed: false,' after the
# 'priority: "Medium",' line inside the addTask() literal.
# Whitespace-tolerant: captures existing indentation, reuses it.
# ------------------------------------------------------------
echo "-- command-palette.tsx: adding completed field --"
if grep -qE '^[[:space:]]*priority: "Medium",[[:space:]]*$' "$CMD_PALETTE"; then
  if grep -q "completed: false," "$CMD_PALETTE"; then
    echo "[skip] completed: false, already present."
  else
    sed -i -E 's/^([[:space:]]*)priority: "Medium",[[:space:]]*$/\1priority: "Medium",\n\1completed: false,/' "$CMD_PALETTE"
    echo "[fixed] Added completed: false, after priority: \"Medium\","
  fi
else
  echo "[not found] Couldn't find the expected 'priority: \"Medium\",' line — check manually, file may have shifted."
fi
echo ""

# ------------------------------------------------------------
# FIX: pairing-modal.tsx — replace { status: string } callback
# shape with the provider's real { connected: boolean } shape,
# in both startPairing and joinRoom. Substring match, whitespace
# outside the match is untouched.
# ------------------------------------------------------------
echo "-- pairing-modal.tsx: aligning callback shape with provider's real event --"

if grep -qF "({ status }: { status: string }) => {" "$PAIRING_MODAL"; then
  perl -0777 -pi -e "s/\Q({ status }: { status: string }) => {\E/({ connected }: { connected: boolean }) => {/g" "$PAIRING_MODAL"
  echo "[fixed] Updated callback signature (both occurrences)."
else
  echo "[not found] Signature line not found verbatim — check manually."
fi

if grep -qF "if (status === 'connected') {" "$PAIRING_MODAL"; then
  perl -0777 -pi -e "s/\Qif (status === 'connected') {\E/if (connected) {/g" "$PAIRING_MODAL"
  echo "[fixed] Updated 'if (status === connected)' checks (both occurrences)."
else
  echo "[not found] 'if (status ===' check not found verbatim — check manually."
fi

if grep -qF "} else if (status === 'disconnected') {" "$PAIRING_MODAL"; then
  perl -0777 -pi -e "s/\Q} else if (status === 'disconnected') {\E/} else {/g" "$PAIRING_MODAL"
  echo "[fixed] Simplified the disconnected branch to a plain else."
else
  echo "[not found] disconnected branch not found verbatim — check manually."
fi
echo ""

# ------------------------------------------------------------
# STILL NEEDED — print diagnostics for the two unresolved items
# ------------------------------------------------------------
echo "============================================================"
echo "STILL NEEDS ONE MORE LOOK — run these and paste back the output:"
echo "============================================================"
echo ""
echo "1) Habit type definition (for the icon/color field mismatch):"
echo "   grep -rn \"interface Habit\\|type Habit\" $SRC"
echo ""
echo "2) task-manager.tsx around the reminderInput usage site:"
echo "   sed -n '175,200p' $TASK_MANAGER"
echo ""
echo "Run those two, paste the output back, and the last three errors"
echo "get a precise fix instead of another guess."
echo ""
echo "Then re-run: pnpm run typecheck"
