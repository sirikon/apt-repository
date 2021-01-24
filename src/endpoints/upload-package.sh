#!/usr/bin/env bash
set -euo pipefail

source "./src/utils.sh"

if [ "${v_secret:-""}" != "${APT_UPLOAD_SECRET}" ]; then
    headers \
        "Status: 401" \
        "Content-Type: text/plain"

    l "Unauthorized"
    exit 0
fi

mv "${filepath_package}" "/data/packages/${v_packageName}"

refresh-database

headers "Status: 200"
