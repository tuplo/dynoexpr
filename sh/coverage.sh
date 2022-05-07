#!/usr/bin/env bash
set -euo pipefail

main() {
  rm -rf ./node_modules/.cache
  rm -rf coverage/
  rm -rf .nyc_output/

  NODE_ENV=test LOG_LEVEL=silent nyc yarn test:ci \
    --coverage true --coverageReporters lcov
}

main
