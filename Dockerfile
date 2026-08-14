FROM ghcr.io/cirrusci/flutter:stable AS builder

WORKDIR /app

COPY pubspec.yaml pubspec.lock ./

RUN flutter pub get

COPY lib ./lib
COPY web ./web
COPY assets ./assets

RUN flutter build web --release

FROM nginx:alpine

COPY --from=builder /app/build/web /usr/share/nginx/html

COPY nginx.conf.template /etc/nginx/templates/default.conf.template

CMD ["nginx", "-g", "daemon off;"]
