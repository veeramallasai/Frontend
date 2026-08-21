FROM ghcr.io/cirruslabs/flutter:stable AS builder

WORKDIR /app

COPY pubspec.yaml pubspec.lock ./

RUN flutter pub get

COPY lib ./lib
COPY web ./web
COPY assets ./assets

RUN flutter build web --release

FROM nginx:alpine

RUN apk add --no-cache gettext

COPY --from=builder /app/build/web /usr/share/nginx/html

COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY docker-entrypoint.sh /docker-entrypoint-railway.sh
RUN chmod +x /docker-entrypoint-railway.sh

ENV PORT=8080

ENTRYPOINT ["/docker-entrypoint-railway.sh"]
CMD ["nginx", "-g", "daemon off;"]
