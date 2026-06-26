#!/bin/bash
set -euo pipefail

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:${PATH:-}"

APP_DIR="$(cd "$(dirname "$0")" && pwd)"
PORT=3000
URL="http://localhost:${PORT}"
NEXT_LOG="/tmp/xhs-poster-next.log"

cd "$APP_DIR"

if curl -fsS --max-time 2 "$URL" >/dev/null 2>&1; then
  open "http://localhost:3000"
  exit 0
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "没有找到 npm。请先安装 Node.js，再启动小红书卡片工具。"
  exit 1
fi

nohup npm run dev -- --port 3000 >"$NEXT_LOG" 2>&1 &
SERVER_PID=$!
disown "$SERVER_PID" >/dev/null 2>&1 || true

for _ in {1..45}; do
  if curl -fsS --max-time 2 "$URL" >/dev/null 2>&1; then
    open "http://localhost:3000"
    exit 0
  fi

  if ! kill -0 "$SERVER_PID" >/dev/null 2>&1; then
    echo "小红书卡片工具启动失败。日志：${NEXT_LOG}"
    exit 1
  fi

  sleep 1
done

open "http://localhost:3000"
