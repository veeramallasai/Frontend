#!/bin/sh
set -e

PORT="${PORT:-8080}"

# Substitute dynamic Railway $PORT into Nginx config template if present
if [ -f /etc/nginx/templates/default.conf.template ]; then
  envsubst '${PORT}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf
fi

# If Nginx web server is available (e.g., inside Docker container)
if command -v nginx >/dev/null 2>&1; then
  echo "Starting Nginx web server on port $PORT..."
  exec nginx -g "daemon off;"
fi

# Fallback runner for non-Docker / Nixpacks environments
if [ ! -d "build/web" ]; then
  echo "build/web directory not found. Checking for Flutter SDK..."
  if ! command -v flutter >/dev/null 2>&1; then
    echo "Installing Flutter SDK..."
    git clone https://github.com/flutter/flutter.git --depth 1 -b stable /tmp/flutter
    export PATH="/tmp/flutter/bin:$PATH"
  fi
  echo "Building Flutter Web release package..."
  flutter pub get
  flutter build web --release
fi

echo "Serving Flutter Web build on port $PORT..."
if command -v python3 >/dev/null 2>&1; then
  cd build/web
  exec python3 -m http.server "$PORT" --bind 0.0.0.0
elif command -v npx >/dev/null 2>&1; then
  exec npx serve -s build/web -l "$PORT"
else
  echo "No suitable web server (Nginx, Python3, or Node) found."
  exit 1
fi
