#!/bin/sh
set -e

aws configure set aws_access_key_id "${AWS_KEY_SERVICE_ECR}"
aws configure set aws_secret_access_key "${AWS_SECRET_SERVICE_ECR}"
aws configure set default.region "${ECR_REGION}"
aws configure set default.source_profile "default"

aws ecr get-login-password | docker login --username AWS --password-stdin "${ECR_URL}"

docker tag  mercurios_server "${ECR_URL}/mercurios:${IMAGE_TAG}"
docker push "${ECR_URL}/mercurios:${IMAGE_TAG}"
