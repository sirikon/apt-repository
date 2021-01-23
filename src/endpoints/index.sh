#!/usr/bin/env bash
set -euo pipefail

source "./src/utils.sh"

headers \
    "Content-Type: text/html"

l "<h1>APT Repository</h1>"

l "<ul>"
get-package-list | while read -r packageName; do
    l "<li><a href=\"/packages/${packageName}\">${packageName}</a></li>"
done
l "</ul>"
