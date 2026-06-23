#!/bin/bash

cd '/Users/luyang/Documents/Content Foundry/xhs-poster-studio' || exit 1

export HOME="/Users/luyang"
export PATH="$HOME/.local/share/fnm/aliases/default/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"

PORT=3017
URL="http://127.0.0.1:${PORT}"
LOG_FILE="/tmp/xhs-poster-studio.log"
BUILD_LOG="/tmp/xhs-poster-studio-build.log"

open_browser() {
  /usr/bin/open "$URL" >/dev/null 2>&1 && return 0
  /usr/bin/osascript -e "open location \"$URL\"" >/dev/null 2>&1 || true
}

show_failure_and_wait() {
  echo "$1"
  if [ -f "$2" ]; then
    echo
    echo "最近日志："
    tail -n 40 "$2"
  fi
  echo
  read -n 1 -p "按任意键关闭..."
  echo
}

stop_existing_server() {
  local pids pid cmd
  pids=$(lsof -tiTCP:"$PORT" -sTCP:LISTEN 2>/dev/null)

  [ -z "$pids" ] && return 0

  for pid in $pids; do
    cmd=$(ps -p "$pid" -o command= 2>/dev/null || true)
    case "$cmd" in
      *xhs-poster-studio*|*next-server*|*"next start"*|*"next dev"*)
        kill "$pid" >/dev/null 2>&1 || true
        ;;
    esac
  done

  sleep 1
}

needs_build() {
  if [ ! -f ".next/BUILD_ID" ]; then
    return 0
  fi

  for file in package.json package-lock.json next.config.mjs tsconfig.json; do
    if [ -f "$file" ] && [ "$file" -nt ".next/BUILD_ID" ]; then
      return 0
    fi
  done

  if [ -d app ] && find app -type f -newer .next/BUILD_ID | grep -q .; then
    return 0
  fi

  return 1
}

stop_existing_server

if needs_build; then
  if ! npm run build >"$BUILD_LOG" 2>&1; then
    show_failure_and_wait "构建失败，未能启动小红书卡片工具。" "$BUILD_LOG"
    exit 1
  fi
fi

(
  for _ in $(seq 1 30); do
    if /usr/bin/curl -fsS "$URL" >/dev/null 2>&1; then
      open_browser
      exit 0
    fi
    sleep 1
  done
) &

echo "正在启动小红书卡片工具，请保持这个窗口开启。"
echo "如果浏览器没有自动打开，可手动访问：$URL"
echo

npm run start -- --hostname 127.0.0.1 --port "$PORT" 2>&1 | tee "$LOG_FILE"
exit "${PIPESTATUS[0]}"
