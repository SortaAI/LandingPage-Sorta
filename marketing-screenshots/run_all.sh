#!/usr/bin/env bash
set -euo pipefail

# Run from repo root: bash marketing-screenshots/run_all.sh
cd "$(dirname "$0")/.."

echo "Installing Python dependencies..."
pip install httpx playwright uvicorn aiofiles --quiet
python -m playwright install chromium

echo "Seeding base DB templates..."
python seed.py

echo "Starting backend on :8000..."
uvicorn app.main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!
echo "Backend started (PID $BACKEND_PID)"
sleep 3

echo "Serving frontend on :3000..."
python -m http.server 3000 --bind 127.0.0.1 --directory frontend &
FRONTEND_PID=$!
echo "Frontend served (PID $FRONTEND_PID)"
sleep 1

cleanup() {
  echo "Stopping servers..."
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
}
trap cleanup EXIT

echo "Seeding demo tenant + patients via API..."
python marketing-screenshots/seed_api.py

echo "Taking screenshots..."
python marketing-screenshots/take_screenshots.py

echo "Done. Screenshots in ./marketing-screenshots/"
