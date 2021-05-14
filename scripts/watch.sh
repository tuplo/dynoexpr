#!/usr/bin/env bash

esbuild src/index.ts --bundle --watch --format=esm --outfile=dist/index.js \
  --external:aws-sdk --external:crypto
