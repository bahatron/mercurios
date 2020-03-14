#!/bin/sh
docker-compose build || exit 1
docker-compose run web sh -c "npm ci"
docker-compose run server sh -c "npm ci && npm run build:clean"
docker-compose run tests sh -c "npm ci && npm run build:clean"
docker-compose down
./dev.sh