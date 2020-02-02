#!/bin/sh
docker-compose -f docker-compose.build.yml build
docker-compose run web npm ci
docker-compose run server npm ci
docker-compose run server npm run build:clean