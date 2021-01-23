#!/usr/bin/env bash
set -euo pipefail

function headers {
    l "${@}"
    l ""
}

function l {
    printf "%s\n" "${@}"
}
