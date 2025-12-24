#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

PORT="${PORT:-5173}"
HOST="${HOST:-127.0.0.1}"
BASE_URL="${PLAYWRIGHT_BASE_URL:-http://${HOST}:${PORT}}"

cleanup() {
  if [[ -n "${DEV_PID:-}" ]] && kill -0 "$DEV_PID" 2>/dev/null; then
    kill "$DEV_PID" 2>/dev/null || true
    wait "$DEV_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

echo "[e2e] Installing Playwright Chromium (one-time, cached)..."
npx playwright install chromium

echo "[e2e] Starting dev server on ${BASE_URL}..."
npm run dev -- --host "$HOST" --port "$PORT" >/dev/null 2>&1 &
DEV_PID="$!"

echo "[e2e] Waiting for dev server..."
for _ in {1..120}; do
  if curl -fsS "${BASE_URL}/" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

if ! curl -fsS "${BASE_URL}/" >/dev/null 2>&1; then
  echo "[e2e] Dev server did not start on ${BASE_URL}"
  exit 1
fi

echo "[e2e] Running Drawing e2e in Chromium..."
PLAYWRIGHT_BASE_URL="$BASE_URL" npx playwright test --project=chromium tests/drawing-smoke.spec.ts

