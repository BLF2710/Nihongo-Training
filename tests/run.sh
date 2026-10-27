#!/bin/sh
# Runs the project's checks. Used locally and by CI (.github/workflows/ci.yml).
#   sh tests/run.sh [unit|db|api|e2e|all] [webBaseUrl]
#   unit  unit tests of both projects (no database, no browser)
#   db    the API's database checks (nihon-api/scripts/verify-*.cjs), on temporary tables, rolled back
#   api   API tests (tests/api), on temporary copies of every table, rolled back
#   e2e   browser tests (tests/e2e) against a running web dev server (default http://localhost:5173), fake API
# db and api need a migrated database (DB_* settings, from nihon-api/.env or the environment) and JWT_SECRET;
# DISPOSABLE_DATABASE=1 also runs the test that creates real accounts (two API processes).
# e2e needs Playwright (npm install at the repository root; `npx playwright install chromium` once).
WHAT="${1:-all}"
BASE="${2:-http://localhost:5173}"
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/.." && pwd)"
OUT="$(mktemp)"
FAILED=0
report() { if grep -qE "^(PASS|Passed)" "$1"; then grep -E "^(PASS|Passed)" "$1" | head -1 | cut -c1-160; else echo "FAIL"; tail -12 "$1" | cut -c1-400; FAILED=$((FAILED + 1)); fi; }
wants() { [ "$WHAT" = all ] || [ "$WHAT" = "$1" ]; }

if wants unit; then
  printf "== nihon-api unit tests: "; if (cd "$ROOT/nihon-api" && npm test > "$OUT" 2>&1); then grep -E "^# (pass|fail)" "$OUT" | tr '\n' ' '; echo; else echo "FAIL"; tail -20 "$OUT"; FAILED=$((FAILED + 1)); fi
  printf "== nihon-web unit tests: "; if (cd "$ROOT/nihon-web" && npm test > "$OUT" 2>&1); then echo "pass"; else echo "FAIL"; tail -20 "$OUT"; FAILED=$((FAILED + 1)); fi
fi

if wants db; then
  for s in verify-kanji verify-unit-assessments verify-answer-receipts verify-kana-selection; do
    printf "== %s: " "$s"; (cd "$ROOT/nihon-api" && timeout 300 node "scripts/$s.cjs" > "$OUT" 2>&1); report "$OUT"
  done
fi

if wants api; then
  # security first: the Google test is built on top of it.
  for m in "$HERE/api/make-security-api.cjs" "$HERE"/api/make-*.cjs; do node "$m" > /dev/null || { echo "FAIL building $(basename "$m")"; FAILED=$((FAILED + 1)); }; done
  for t in "$HERE"/api/review-api.cjs "$HERE"/api/unlock-api.cjs "$HERE"/api/shared-state-api.cjs "$HERE"/api/generated/*-api.cjs; do
    printf "== %s: " "$(basename "$t")"
    # The Google test checks the "not configured" state, so it runs without a client id.
    (cd "$ROOT/nihon-api" && GOOGLE_CLIENT_ID= timeout 300 node "$t" > "$OUT" 2>&1); report "$OUT"
  done
  # Two real API processes sharing state through PostgreSQL. It creates (and then deletes) accounts, so it only
  # runs on a throwaway database.
  printf "== multi-process-api.cjs: "
  if [ "$DISPOSABLE_DATABASE" = 1 ]; then (cd "$ROOT/nihon-api" && timeout 300 node "$HERE/api/multi-process-api.cjs" > "$OUT" 2>&1); report "$OUT"
  else echo "skipped (set DISPOSABLE_DATABASE=1 on a throwaway database)"; fi
fi

if wants e2e; then
  mkdir -p "$HERE/e2e/shots"
  for t in "$HERE"/e2e/*-ui.cjs; do
    printf "== %s: " "$(basename "$t")"; (cd "$HERE/e2e" && timeout 900 node "$t" "$BASE" "$HERE/e2e/shots" > "$OUT" 2>&1); report "$OUT"
    # The review test has a second, administrator part (the question bank).
    if [ "$(basename "$t")" = review-ui.cjs ]; then printf "== review-ui.cjs (admin): "; (cd "$HERE/e2e" && timeout 900 node "$t" "$BASE" "$HERE/e2e/shots" admin-only > "$OUT" 2>&1); report "$OUT"; fi
  done
fi

rm -f "$OUT"
echo "Failures: $FAILED"
[ "$FAILED" = 0 ]
