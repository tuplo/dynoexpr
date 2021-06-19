#!/usr/bin/env bash

rimraf dist
rimraf cjs
tsc --build tsconfig.build.json

esbuild src/index.cjs --bundle --platform=node --outfile=dist/index.cjs \
  --external:aws-sdk
esbuild src/index.ts --bundle --format=esm --outfile=dist/index.mjs \
  --external:aws-sdk --external:crypto

# node12 compatibility
mkdir cjs && cp dist/index.cjs cjs/index.js

cp src/dynoexpr.d.ts dist/dynoexpr.d.ts
