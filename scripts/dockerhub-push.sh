#!/bin/sh
set -e

docker login --username ${DOCKER_USERNAME}  --password ${DOCKER_PASSWORD}
docker tag mercurios-server ${DOCKER_REPOSITORY}mercurios_http:${IMAGE_TAG:-latest}

docker push ${DOCKER_REPOSITORY}mercurios_http:${IMAGE_TAG:-latest}