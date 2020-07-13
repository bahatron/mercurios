#!/bin/sh
set -x
export GITROOT=$(git rev-parse --show-toplevel)

docker-compose -f ${GITROOT}/docker-compose.test.yml down --remove-orphans
docker-compose -f ${GITROOT}/docker-compose.test.yml up -d

# run test
docker-compose -f ${GITROOT}/docker-compose.test.yml exec -T server \
    sh -c "wait-for-it localhost:4254 -t 30 -- npm run test" || exit 1
    
# run benchmark
docker-compose -f ${GITROOT}/docker-compose.test.yml exec -T server \
    sh -c "npm run benchmark -- -d 30 --ping --write --read --competing --json"