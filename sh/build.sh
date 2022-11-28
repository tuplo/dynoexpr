#!/usr/bin/env bash
set -euo pipefail

main() {
  rm -rf dist
  rm -rf cjs
  tsc --build tsconfig.build.json

  esbuild src/cjs/index.cjs \
    --bundle \
    --platform=node \
    --outfile=dist/index.cjs \
    --external:aws-sdk

  esbuild src/index.ts \
    --bundle \
    --platform=node \
    --format=esm \
    --outfile=dist/index.mjs \
    --external:aws-sdk \
    --external:crypto

  # node12 compatibility
  mkdir cjs && cp dist/index.cjs cjs/index.js

  cp src/dynoexpr.d.ts dist/dynoexpr.d.ts
}

main
