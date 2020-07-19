#!/bin/sh

set -e

export COMPOSE_INTERACTIVE_NO_CLI=1

if [ ${BRANCH_NAME:-local} = master ]; then
    echo "master branch, pushing to tag: ${IMAGE_TAG:-latest}"
    docker login --username ${DOCKER_USERNAME}  --password ${DOCKER_PASSWORD}
    docker tag mercurios_server ${DOCKER_REPOSITORY}mercurios_http:${IMAGE_TAG:-latest}

    docker push ${DOCKER_REPOSITORY}mercurios_http:${IMAGE_TAG:-latest}
elif [ ${BRANCH_NAME:-none} != none ]; then
    echo "branch is ${BRANCH_NAME:-none}, skipping"
else
    echo "skipping push"
fi