#!/bin/sh
set -x
export GITROOT=$(git rev-parse --show-toplevel)

docker-compose -f ${GITROOT}/docker-compose.test.yml up -d

docker exec mercurios-server sh -c \
    "wait-for-it localhost:4254 -t 60 -s -- npm run benchmark -- --write --read --ping"