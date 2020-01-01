#!/bin/sh

./test.sh

if [ [$TRAVIS_BRANCH = master] ];
then
 docker login --username $DOCKER_USERNAME  --password $DOCKER_PASSWORD
 docker push bahatron/mercurios_http
else
    echo "no master, skipping push"
fi

