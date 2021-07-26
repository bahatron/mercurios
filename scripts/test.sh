#!/bin/bash
set -o pipefail

export GITROOT=$(git rev-parse --show-toplevel)

docker-compose -f ${GITROOT}/docker-compose.test.yml up -d

# run tests for mysql driver
echo "testing postgres driver..."
docker exec mercurios-postgres-driver sh -c "wait-for-it localhost:4254 -t 60 -- npm run test"
echo "postgres driver test completed"

echo "testing mysql driver..."
docker exec mercurios-mysql-driver sh -c "wait-for-it localhost:4254 -t 60 -- npm run test"
echo "mysql driver test completed"

echo "testing mongo driver..."
docker exec mercurios-mongo-driver sh -c "wait-for-it localhost:4254 -t 60 -- npm run test"
echo "mongo driver test completed"


docker exec mercurios-client sh -c "npm run test"