#!/usr/bin/env bash
set -euo pipefail

main() {
  esbuild src/index.ts \
    --bundle --watch --format=esm --platform=node --outfile=dist/index.js \
    --external:aws-sdk
}

main
