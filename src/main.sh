#!/usr/bin/env bash
set -euo pipefail

./shell2http \
    -host 0.0.0.0 \
    -port 80 \
    -no-index \
    -cgi \
    "/" "./src/endpoints/index.sh"
