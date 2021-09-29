#!/bin/sh
set -e

# export GITROOT=$(git rev-parse --show-toplevel)
# TEST_COMPOSE="${GITROOT}/docker-compose.test.yml"

# docker-compose -f ${TEST_COMPOSE} up -d

# echo "testing postgres driver..."
# docker exec mercurios-postgres-driver sh -c "wait-for-it localhost:4254 -t 60 -- npm run test"
# echo "postgres driver test completed"

# echo "testing mysql driver..."
# docker exec mercurios-mysql-driver sh -c "wait-for-it localhost:4254 -t 60 -- npm run test"
# echo "mysql driver test completed"

# echo "testing mongo driver..."
# docker exec mercurios-mongo-driver sh -c "wait-for-it localhost:4254 -t 60 -- npm run test"
# echo "mongo driver test completed"

# echo "testing mercurios client..."
# docker-compose -f ${TEST_COMPOSE} run mercurios-client sh -c "MERCURIOS_URL=http://mercurios-postgres-driver:4254 npm run test"
# echo "mercurios client test completed"