#!/bin/sh
set -x
export GITROOT=$(git rev-parse --show-toplevel)

docker-compose -f ${GITROOT}/docker-compose.test.yml down
docker-compose -f ${GITROOT}/docker-compose.test.yml up -d
docker-compose -f ${GITROOT}/docker-compose.test.yml exec -T server sh -c "wait-for-it localhost:4254 -- npm run migrate:pg && npm run test" || exit 1
docker-compose -f ${GITROOT}/docker-compose.test.yml exec -T server npm run benchmark -- -d 30 --ping --write --read --competing --multi