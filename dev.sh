#!/bin/sh

if [ "${1}" = "setup" ]; then
    docker-compose build || exit 1
    docker-compose run web sh -c "npm ci"
    docker-compose run server sh -c "npm ci && npm run build:clean"
    docker-compose run tests sh -c "npm ci && npm run build:clean"
fi

docker-compose down --remove-orphans
docker-compose up