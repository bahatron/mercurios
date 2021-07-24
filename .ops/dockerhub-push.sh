#!/bin/sh
set -e

if [ ${BRANCH:-"local"} != "master" ]; then
	echo "Skipping push...";
	exit 0;
fi

docker login --username ${DOCKER_USERNAME}  --password ${DOCKER_PASSWORD}
docker tag mercurios-server ${DOCKER_REPOSITORY}/mercurios:${IMAGE_TAG:-latest}

docker push ${DOCKER_REPOSITORY}/mercurios:${IMAGE_TAG:-latest}