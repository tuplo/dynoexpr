#!/usr/bin/env bash

rimraf ./node_modules/.cache
rimraf coverage/
rimraf .nyc_output/

NODE_ENV=test LOG_LEVEL=silent nyc yarn test:ci \
  --coverage true --coverageReporters lcov
