#!/bin/sh

docker login --username $DOCKER_USERNAME  --password $DOCKER_PASSWORD

./test.sh

if $TRAVIS_BRANCH != "master" then
 echo "it's not master"
else
echo "Yes!, it is MASTER!"
fi


docker push bahatron/mercurios_http