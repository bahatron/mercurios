#!/bin/bash
set -o pipefail

export GITROOT=$(git rev-parse --show-toplevel)

docker-compose -f ${GITROOT}/docker-compose.test.yml up -d

# run tests for mysql driver
docker-compose -f ${GITROOT}/docker-compose.test.yml exec -T mercurios-postgres \
    sh -c "wait-for-it mercurios-postgres:4254 -t 30 -- npm run test"

docker-compose -f ${GITROOT}/docker-compose.test.yml exec -T mercurios-mysql \
    sh -c "wait-for-it mercurios-mysql:4254 -t 30 -- npm run test"

MERCURIOS_URL=http://mercurios-postgres:4254 docker-compose -f ${GITROOT}/docker-compose.test.yml run -T mercurios-client \
    sh -c "npm run test"

# MERCURIOS_URL=http://mercurios-mysql:4254 docker-compose -f ${GITROOT}/docker-compose.test.yml run -T mercurios-client \
#     sh -c "npm run test"

docker-compose -f ${GITROOT}/docker-compose.test.yml logs --no-color -t mercurios-postgres mercurios-mysql > mercurios-test-logs