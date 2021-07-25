#!/bin/bash
set -o pipefail

export GITROOT=$(git rev-parse --show-toplevel)

docker-compose -f ${GITROOT}/docker-compose.test.yml up -d

# run tests for mysql driver
docker exec mercurios-postgres-driver sh -c "wait-for-it localhost:4254 -t 30 -- npm run test"
docker exec mercurios-mysql-driver sh -c "wait-for-it localhost:4254 -t 30 -- npm run test"

MERCURIOS_URL=http://mercurios-postgres-driver:4254 docker exec mercurios-client sh -c "npm run test"