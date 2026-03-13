#!/bin/sh
set -e

: "${PORT:=3000}"

envsubst '${PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

if [ -f /usr/share/nginx/html/env.template.js ]; then
  envsubst '${VITE_API_BASE_URL}' < /usr/share/nginx/html/env.template.js > /usr/share/nginx/html/env.js
fi

exec nginx -g 'daemon off;'
