docker login --username $DOCKER_USERNAME  --password $DOCKER_password

docker tag mercurios_http bahatron/mercurios_http

docker push bahatron/mercurios_http