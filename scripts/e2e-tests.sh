#!/usr/bin/env bash
set -euo pipefail

# Start backend and frontend, run Playwright
# Requirements: MySQL/test DB set up, backend/.env configured to connect to DB.

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
VITE_LOG="$(mktemp)"  # finding the chosen port for output

# killing previous processes and restarting them
echo "Killing processes from previous runs..."
pkill -f "vite" 2>/dev/null || true
pkill -f "nodemon server.js" 2>/dev/null || true
sleep 1

# installations
echo "Installing frontend dependencies..."
cd "$ROOT_DIR/frontend"
npm install --no-audit --no-fund

echo "Installing Playwright browsers..."
npx playwright install

# starting backend
echo "Starting backend..."
cd "$ROOT_DIR/backend"
npm run devStart > /dev/null 2>&1 &
BACKEND_PID=$!
echo "backend pid=$BACKEND_PID"

# starting frontend
echo "Starting frontend..."
cd "$ROOT_DIR/frontend"
npm run dev > "$VITE_LOG" 2>&1 &
FRONTEND_PID=$!
echo "frontend pid=$FRONTEND_PID"

cleanup() {
	echo "Cleaning up..."
	if kill -0 "$FRONTEND_PID" 2>/dev/null; then kill "$FRONTEND_PID" || true; fi
	if kill -0 "$BACKEND_PID" 2>/dev/null; then kill "$BACKEND_PID" || true; fi
	# Kill child processes that npm may have left behind
	pkill -f "vite" 2>/dev/null || true
	pkill -f "nodemon server.js" 2>/dev/null || true
	rm -f "$VITE_LOG"
}
trap cleanup EXIT

wait_for_url() {
	local url=$1
	local timeout=${2:-60}
	local start=$(date +%s)
	while true; do
		if curl -s -I "$url" >/dev/null 2>&1; then
			return 0
		fi
		now=$(date +%s)
		if [ $((now - start)) -ge $timeout ]; then
			return 1
		fi
		sleep 1
	done
}

# Vite picks the port
echo "Waiting for Vite to report its URL..."
FRONTEND_URL=""
start_ts=$(date +%s)
while true; do
	FRONTEND_URL=$(grep -Eo "http://(127\.0\.0\.1|localhost):[0-9]+" "$VITE_LOG" 2>/dev/null | head -n1 || true)
	if [ -n "$FRONTEND_URL" ]; then
		echo "Frontend URL: $FRONTEND_URL"
		break
	fi
	now_ts=$(date +%s)
	if [ $((now_ts - start_ts)) -ge 30 ]; then
		echo "Vite did not print a URL within 30s."
		exit 2
	fi
	sleep 1
done

echo "Waiting for frontend to be reachable at $FRONTEND_URL..."
if ! wait_for_url "$FRONTEND_URL" 60; then
	echo "Frontend did not become reachable in time."
	exit 2
fi

echo "Waiting for backend to be ready (http://127.0.0.1:3000)..."
if ! wait_for_url "http://127.0.0.1:3000" 120; then
	echo "Backend did not become ready in time."
	exit 3
fi

# confirm that DB is up
echo "Waiting for backend DB to accept queries (/users)..."
DB_READY=0
for i in $(seq 1 15); do
	if curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:3000/users" | grep -qE "^[0-9]"; then
		DB_READY=1
		break
	fi
	sleep 1
done
if [ "$DB_READY" -eq 0 ]; then
	echo "Backend DB did not become ready in time."
	exit 3
fi
sleep 1

echo "Running Playwright tests..."
cd "$ROOT_DIR/frontend"
PLAYWRIGHT_BASE_URL="$FRONTEND_URL" npx playwright test "$@"

EXIT_CODE=$?

echo "E2E tests finished with exit code $EXIT_CODE"
exit $EXIT_CODE
