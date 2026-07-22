#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# Nexos — TypeScript error fix script
# Run from the repo root:
#   bash fix-typecheck-errors.sh
#
# Philosophy: automate only what's safely mechanical (additive,
# unambiguous). For fixes that depend on your actual type shapes,
# print the real surrounding code instead of guessing blind — a
# wrong guess on a type shape is worse than no guess at all.
# ============================================================

FRONTEND="frontend/nexus-dashboard"
SRC="$FRONTEND/src"

if [ ! -d "$SRC" ]; then
  echo "Can't find $SRC — run this script from the repo root."
  exit 1
fi

echo "== Nexos TypeScript fix script =="

mkdir -p .fix-backups
for f in "$SRC/main.tsx" \
         "$SRC/components/task-manager.tsx" \
         "$SRC/components/command-palette.tsx" \
         "$SRC/components/pairing-modal.tsx"; do
  [ -f "$f" ] && cp "$f" ".fix-backups/$(basename "$f").bak"
done
echo "Backed up existing files to .fix-backups/"
echo ""

# ------------------------------------------------------------
# FIX 1 — main.tsx: Cannot find module 'virtual:pwa-register'
# Purely additive: adds a type reference. Safe to automate.
# ------------------------------------------------------------
VITE_ENV="$SRC/vite-env.d.ts"
REF_LINE='/// <reference types="vite-plugin-pwa/client" />'

echo "-- Fix 1: virtual:pwa-register types --"
if [ -f "$VITE_ENV" ]; then
  if grep -qF "$REF_LINE" "$VITE_ENV"; then
    echo "[skip] $VITE_ENV already has the reference."
  else
    { echo "$REF_LINE"; cat "$VITE_ENV"; } > "$VITE_ENV.tmp" && mv "$VITE_ENV.tmp" "$VITE_ENV"
    echo "[fixed] Added reference line to $VITE_ENV"
  fi
else
  echo "$REF_LINE" > "$VITE_ENV"
  echo "[created] $VITE_ENV with the reference line"
fi
echo ""

# ------------------------------------------------------------
# FIX 2 — task-manager.tsx: reminderInput / setReminderInput missing
# Best-guess insertion: adds the useState line right after the last
# existing useState in the file. Mechanical, but VERIFY placement —
# I can't see whether this lands inside the right component.
# ------------------------------------------------------------
TASK_MANAGER="$SRC/components/task-manager.tsx"
NEW_STATE="  const [reminderInput, setReminderInput] = useState<string>('');"

echo "-- Fix 2: reminderInput state --"
if [ -f "$TASK_MANAGER" ]; then
  if grep -q "reminderInput" "$TASK_MANAGER"; then
    echo "[skip] reminderInput already referenced somewhere in $TASK_MANAGER — left untouched, check manually."
  else
    LAST_USESTATE_LINE=$(grep -n "useState" "$TASK_MANAGER" | tail -1 | cut -d: -f1 || true)
    if [ -n "${LAST_USESTATE_LINE:-}" ]; then
      awk -v n="$LAST_USESTATE_LINE" -v ins="$NEW_STATE" \
        'NR==n{print; print ins; next} {print}' "$TASK_MANAGER" > "$TASK_MANAGER.tmp" \
        && mv "$TASK_MANAGER.tmp" "$TASK_MANAGER"
      echo "[fixed] Inserted reminderInput useState after line $LAST_USESTATE_LINE."
      echo "        >>> VERIFY it landed inside the correct component function. <<<"
    else
      echo "[manual] No existing useState found — add this line yourself near your other state:"
      echo "  $NEW_STATE"
    fi
  fi
else
  echo "[missing] $TASK_MANAGER not found — check the path."
fi
echo ""

# ------------------------------------------------------------
# FIX 3 & 4 — command-palette.tsx: missing 'completed' field (~line 90)
# and an unknown property in an object literal (~line 107).
# These depend on your real Task type — printing context, not guessing.
# ------------------------------------------------------------
CMD_PALETTE="$SRC/components/command-palette.tsx"
echo "-- Fix 3 & 4: command-palette.tsx (manual — context below) --"
if [ -f "$CMD_PALETTE" ]; then
  echo "   Lines 82-112:"
  sed -n '82,112p' "$CMD_PALETTE" | sed 's/^/   /'
else
  echo "[missing] $CMD_PALETTE not found."
fi
echo ""
echo "   Manual fix (~line 90): add 'completed: false,' to that object literal."
echo "   Manual fix (~line 107): open your Task type definition and compare"
echo "   its field names against this literal — rename or drop the extra key"
echo "   to match, rather than assuming which side is 'wrong.'"
echo ""

# ------------------------------------------------------------
# FIX 5 & 6 — pairing-modal.tsx: '{ connected: boolean }' passed where
# '{ status: string }' is expected (lines 30, 54). A real type decision —
# printing context, not guessing.
# ------------------------------------------------------------
PAIRING_MODAL="$SRC/components/pairing-modal.tsx"
echo "-- Fix 5 & 6: pairing-modal.tsx (manual — context below) --"
if [ -f "$PAIRING_MODAL" ]; then
  echo "   Lines 20-60:"
  sed -n '20,60p' "$PAIRING_MODAL" | sed 's/^/   /'
else
  echo "[missing] $PAIRING_MODAL not found."
fi
echo ""
echo "   Manual fix: pick ONE shape for pairing state. Recommended:"
echo "     type PairingStatus = 'idle' | 'waiting' | 'connected' | 'failed';"
echo "   Replace every '{ connected: boolean }' with '{ status: PairingStatus }'"
echo "   and update every reader/caller to match — don't leave both shapes"
echo "   coexisting, that's exactly how this bug happened the first time."
echo ""

echo "== Automatic fixes applied. Now run: pnpm run typecheck =="
echo "Originals are saved in .fix-backups/ if anything needs reverting."
