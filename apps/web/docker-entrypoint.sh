#!/bin/sh
set -eu

cd /web

NPM_STRICT_SSL="${NPM_STRICT_SSL:-0}"
NPM_REGISTRY="${NPM_REGISTRY:-https://registry.npmjs.org/}"
NPM_INSTALL_RETRIES="${NPM_INSTALL_RETRIES:-8}"

if [ "$NPM_STRICT_SSL" = "0" ]; then
  npm config set strict-ssl false >/dev/null 2>&1 || true
  # Some networks break TLS in containers; for local dev we allow bypass.
  export NODE_TLS_REJECT_UNAUTHORIZED=0
  npm config set registry "http://registry.npmjs.org/" >/dev/null 2>&1 || true
else
  npm config set registry "$NPM_REGISTRY" >/dev/null 2>&1 || true
fi

npm config set fund false >/dev/null 2>&1 || true
npm config set audit false >/dev/null 2>&1 || true
npm config set fetch-retries 5 >/dev/null 2>&1 || true
npm config set fetch-retry-mintimeout 20000 >/dev/null 2>&1 || true
npm config set fetch-retry-maxtimeout 120000 >/dev/null 2>&1 || true

i=1
until npm install --no-audit --no-fund; do
  if [ "$i" -ge "$NPM_INSTALL_RETRIES" ]; then
    echo "npm install failed after $i attempts" >&2
    exit 1
  fi
  sleep_s=$((i * 5))
  echo "npm install failed, retrying in ${sleep_s}s (attempt $((i + 1))/${NPM_INSTALL_RETRIES})" >&2
  sleep "$sleep_s"
  i=$((i + 1))
done

exec "$@"

