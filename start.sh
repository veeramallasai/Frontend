#!/bin/sh
set -e

echo "Installing Flutter..."
git clone https://github.com/flutter/flutter.git --depth 1 -b stable /opt/flutter
export PATH="/opt/flutter/bin:$PATH"

flutter --version
flutter pub get
flutter build web --release --no-wasm-dry-run

cd build/web
python3 -m http.server "${PORT:-8080}" --bind 0.0.0.0
