#!/bin/sh
set -e

# Substitute $PORT variable into Nginx default configuration while preserving Nginx variables (like $uri)
envsubst '${PORT}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

# Execute Nginx in foreground
exec "$@"
