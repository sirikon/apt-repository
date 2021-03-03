#!/usr/bin/env bash
set -euo pipefail

source "./src/utils.sh"

if [ "${REQUEST_URI}" != '/' ]; then
    headers "Status: 404"
    exit 0
fi

headers \
    "Content-Type: text/html"

l "<html><head><meta charset=\"utf-8\"/><title>APT Repository</title></head><body>"

l "<h1>APT Repository</h1>"

l "<ul>"
get-package-list | while read -r packageName; do
    l "<li><a href=\"/packages/${packageName}\">${packageName}</a></li>"
done
l "</ul>"

l "</body></html>"
