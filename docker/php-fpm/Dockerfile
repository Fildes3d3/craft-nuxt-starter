# PHP 8.2.35 patches PHP2Shell (CVE-2026-109618 / CVE-2026-109619).
# Pinned to bookworm because the bullseye variant is EOL and never received
# the fix — use a patched 8.2.x bookworm tag, not 8.2-fpm-bullseye.
FROM php:8.2.35-fpm-bookworm

ENV DEBIAN_FRONTEND=noninteractive

# Composer
RUN curl -sS https://getcomposer.org/installer | php -- \
        --install-dir=/usr/local/bin \
        --filename=composer

RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends \
            curl \
            git \
            unzip \
            zip \
            mariadb-client \
            libzip-dev \
            libpng-dev \
            libjpeg-dev \
            libwebp-dev \
            libfreetype6-dev \
            libicu-dev \
            libonig-dev; \
    rm -rf /var/lib/apt/lists/*

RUN set -eux; \
    docker-php-ext-install bcmath intl zip pdo_mysql; \
    docker-php-ext-configure gd \
            --prefix=/usr \
            --with-jpeg \
            --with-webp \
            --with-freetype; \
    docker-php-ext-install gd

RUN apt-get clean; rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* /usr/share/doc/*

COPY php-ini-overrides.ini /usr/local/etc/php/conf.d/php-ini-overrides.ini

RUN usermod -u 1000 www-data

WORKDIR /app
