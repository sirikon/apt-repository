#!/usr/bin/env bash
set -euo pipefail

function headers {
    l "${@}"
    l ""
}

function l {
    printf "%s\n" "${@}"
}

function get-package-list {(
    cd /data/packages
    find -type f | while read line; do
        l $(basename "$line")
    done
)}
