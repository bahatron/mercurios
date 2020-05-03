#!/bin/sh

set -e

docker-compose build
./test.sh

if [ ${_branch:-local} = master ]; then
    echo "master branch, pushing to tag ${_tag}"
    docker login --username $DOCKER_USERNAME  --password $DOCKER_PASSWORD
    docker tag mercurios_http bahatron/mercurios_http:${_tag:-latest}

    docker push bahatron/mercurios_http:${_tag:-latest}
elif [ ${_branch:-local} != local ]; then
    echo "pushing to tag ${_branch}"
    docker login --username $DOCKER_USERNAME  --password $DOCKER_PASSWORD
    docker tag mercurios_http bahatron/mercurios_http:${_branch}

    docker push bahatron/mercurios_http:${_branch}
else
    echo "skipping push"
fi

