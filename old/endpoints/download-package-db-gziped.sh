#!/usr/bin/env bash
set -euo pipefail

source "./src/utils.sh"

headers \
    "Status: 200" \
    "Content-Type: text/plain"

cat "/data/Packages.gz"
