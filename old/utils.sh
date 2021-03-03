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

function find-package {
    requestedPackageName="${1}"
    get-package-list | while read -r packageName; do
        if [ "${packageName}" = "${requestedPackageName}" ]; then
            printf "%s" "/data/packages/${packageName}"
        fi
    done
}

function refresh-database {(
    cd "/data"
    apt-ftparchive packages packages > Packages
    gzip -k -f Packages
)}
