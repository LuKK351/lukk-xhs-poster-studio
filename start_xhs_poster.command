#!/bin/bash

cd '/Users/luyang/Documents/Content Foundry/xhs-poster-studio' || exit 1

export HOME="/Users/luyang"
export PATH="$HOME/.local/share/fnm/aliases/default/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"

PORT=3017
URL="http://127.0.0.1:${PORT}"
LOG_FILE="/tmp/xhs-poster-studio.log"

open_browser() {
  /usr/bin/open "$URL" >/dev/null 2>&1 && return 0
  /usr/bin/osascript -e "open location \"$URL\"" >/dev/null 2>&1 || true
}

if curl -s "$URL" >/dev/null 2>&1; then
  open_browser
  exit 0
fi

nohup npm run dev -- --hostname 127.0.0.1 --port "$PORT" >"$LOG_FILE" 2>&1 &
disown

for _ in $(seq 1 30); do
  if curl -s "$URL" >/dev/null 2>&1; then
    open_browser
    exit 0
  fi
  sleep 1
done

echo "服务已尝试启动，但浏览器未自动打开。"
echo "你可以稍后手动访问：$URL"
echo "日志文件：$LOG_FILE"
read -n 1 -p "按任意键关闭..."
echo
