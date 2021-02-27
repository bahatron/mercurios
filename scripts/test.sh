#!/bin/sh
set -x
export GITROOT=$(git rev-parse --show-toplevel)

docker-compose -f ${GITROOT}/docker-compose.test.yml up -d mysql nats
docker-compose -f ${GITROOT}/docker-compose.test.yml run -T mercurios-server \
    sh -c "wait-for-it mysql:3306 -- npm start"

docker-compose -f ${GITROOT}/docker-compose.test.yml run -T mercurios-server \
    sh -c "wait-for-it mercurios-server:4254 -t 30 -- npm run test" || exit 1
docker-compose -f ${GITROOT}/docker-compose.test.yml run -T mercurios-client \
    sh -c "npm run test" || exit 1