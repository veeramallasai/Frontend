#!/bin/sh
set -e

# Substitute dynamic Railway $PORT variable into Nginx default configuration while preserving Nginx variables
if [ -f /etc/nginx/templates/default.conf.template ]; then
  envsubst '${PORT}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf
fi

# Execute entrypoint command
exec "$@"
