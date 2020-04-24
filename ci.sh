#!/bin/sh

set -e

docker-compose build
./test.sh

if [ ${_branch:-local} = master ];
then
    echo "master branch, pushing to repo"
    docker login --username $DOCKER_USERNAME  --password $DOCKER_PASSWORD
    docker tag mercurios_http bahatron/mercurios_http:${_tag:-latest}

    docker push bahatron/mercurios_http:${_tag:-latest}
else
    echo "no master, skipping push"
fi

