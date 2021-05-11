#!/usr/bin/env bash

rimraf dist
esbuild src/index.ts --bundle --platform=node --outfile=dist/index.js --external:aws-sdk
esbuild src/index.ts --bundle --outfile=dist/index.modern.js --external:aws-sdk --external:crypto
tsc --build tsconfig.build.json
cp src/dynoexpr.d.ts dist/dynoexpr.d.ts
