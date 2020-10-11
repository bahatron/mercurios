#!/bin/sh
set -x
export GITROOT=$(git rev-parse --show-toplevel)

docker-compose -f ${GITROOT}/docker-compose.test.yml up -d

docker-compose -f ${GITROOT}/docker-compose.test.yml run -T mercurios_server \
    sh -c "wait-for-it mercurios_server:4254 -t 30 -- npm run test" || exit 1
docker-compose -f ${GITROOT}/docker-compose.test.yml run -T mercurios_client \
    sh -c "npm run test" || exit 1