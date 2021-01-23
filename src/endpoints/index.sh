#!/usr/bin/env bash
set -euo pipefail

source "./src/utils.sh"

headers \
    "Content-Type: text/html"

l "<h1>Hello World!</h1>"
