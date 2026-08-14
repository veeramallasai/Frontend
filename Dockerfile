# Stage 1: Build Flutter Web application
FROM ghcr.io/cirrusci/flutter:stable AS build

WORKDIR /app

# Copy pubspec dependencies first for layer caching
COPY pubspec.yaml pubspec.lock ./
RUN flutter pub get

# Copy full application codebase
COPY . .

# Build Flutter Web release bundle
RUN flutter build web --release

# Stage 2: Production Nginx Server
FROM nginx:alpine

# Copy built web artifacts from build stage
COPY --from=build /app/build/web /usr/share/nginx/html

# Copy Nginx configuration template and dynamic port scripts
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY docker-entrypoint.sh /docker-entrypoint.sh
COPY start.sh /start.sh

RUN chmod +x /docker-entrypoint.sh /start.sh

# Default fallback port
ENV PORT=80

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["/start.sh"]
