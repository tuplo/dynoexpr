#!/usr/bin/env bash

rimraf dist
microbundle --target node --sourcemap false --format cjs,modern --tsconfig tsconfig.build.json
cp src/dynoexpr.d.ts dist/dynoexpr.d.ts
