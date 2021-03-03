#!/usr/bin/env bash
set -euo pipefail

source "./src/utils.sh"

if [ "${REQUEST_URI}" = '/packages/' ]; then
    headers "Location: /"
    exit 0
fi

requestedPackageName="$(basename ${REQUEST_URI})"
matchingPackagePath="$(find-package "${requestedPackageName}")"

if [ "${matchingPackagePath}" = '' ]; then
    headers \
        "Content-Type: text/plain" \
        "Status: 404"
    l "${requestedPackageName} not found"
    exit 0
fi

headers \
    "Status: 200" \
    "Content-Type: application/octet-stream"

cat "${matchingPackagePath}"
