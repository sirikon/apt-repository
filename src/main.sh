#!/usr/bin/env bash
set -euo pipefail

mkdir -p /data/packages
./shell2http \
    -host 0.0.0.0 -port 80 \
    -export-vars="PATH,HOME,LANG,USER,TMPDIR,APT_UPLOAD_SECRET" \
    -no-index -cgi -form \
    "/" "./src/endpoints/index.sh" \
    "/packages/" "./src/endpoints/download-package.sh" \
    "/upload" "./src/endpoints/upload-package.sh"
