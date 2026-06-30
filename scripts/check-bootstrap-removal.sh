#!/usr/bin/env bash
#
# Scoped removal gates for the Bootstrap -> Tailwind/shadcn migration (Phase 8).
#
# These are SCOPED checks, not raw word matches: a broad `rg "row|col-|btn"`
# false-matches arrow/grow/browser/control. We only gate on:
#   1. reactstrap imports          (the real runtime dependency)
#   2. data-bs-* attributes        (Bootstrap JS behavior hooks)
#   3. bootstrap/reactstrap in package.json
#
# Exit non-zero when any gate is non-empty, so this can guard the final
# dependency removal. Run: bash scripts/check-bootstrap-removal.sh
#
# Baseline at Phase 8 (partial): 270 reactstrap-importing files, 28 data-bs files.
set -uo pipefail

cd "$(dirname "$0")/.." || exit 2

fail=0

echo "== Gate 1: reactstrap imports (excluding the migration-ui compat layer) =="
rs_files=$(grep -rlE "from ['\"]reactstrap['\"]" src/ | grep -v "components/migration-ui" || true)
rs_count=$(printf '%s\n' "$rs_files" | grep -c . || true)
if [ "$rs_count" -gt 0 ]; then
  echo "  $rs_count file(s) still import reactstrap."
  fail=1
else
  echo "  OK: no reactstrap imports."
fi

echo "== Gate 2: data-bs-* attributes =="
bs_files=$(grep -rl "data-bs-" src/ || true)
bs_count=$(printf '%s\n' "$bs_files" | grep -c . || true)
if [ "$bs_count" -gt 0 ]; then
  echo "  $bs_count file(s) still use data-bs-*."
  fail=1
else
  echo "  OK: no data-bs-* attributes."
fi

echo "== Gate 3: bootstrap / reactstrap in package.json =="
if grep -qE '"(bootstrap|reactstrap)"[[:space:]]*:' package.json; then
  echo "  bootstrap/reactstrap still declared in package.json."
  fail=1
else
  echo "  OK: dependencies removed."
fi

echo
if [ "$fail" -eq 0 ]; then
  echo "ALL GATES PASS — safe to remove Bootstrap/reactstrap and their SCSS imports."
else
  echo "GATES OPEN — migration not complete; do NOT remove dependencies yet."
fi
exit "$fail"
