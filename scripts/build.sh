#!/usr/bin/env bash

rimraf dist
tsc --build tsconfig.build.json

esbuild src/index.cjs --bundle --platform=node --outfile=dist/index.cjs \
  --external:aws-sdk
esbuild src/index.ts --bundle --format=esm --outfile=dist/index.js \
  --external:aws-sdk --external:crypto

cp src/dynoexpr.d.ts dist/dynoexpr.d.ts
