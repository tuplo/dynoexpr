#!/usr/bin/env bash

rimraf dist
tsc --build tsconfig.build.json
esbuild src/index.ts --bundle --platform=node --outfile=dist/index.js --external:aws-sdk
esbuild src/index.ts --bundle --outfile=dist/index.modern.js --external:aws-sdk --external:crypto
cp src/dynoexpr.d.ts dist/dynoexpr.d.ts
