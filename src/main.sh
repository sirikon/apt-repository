#!/usr/bin/env bash
set -euo pipefail

mkdir -p /data/packages
./shell2http \
    -host 0.0.0.0 \
    -port 80 \
    -no-index \
    -cgi \
    "/" "./src/endpoints/index.sh" \
    "/packages/" "./src/endpoints/download-package.sh"
