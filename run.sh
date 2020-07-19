#!/bin/bash

export GITROOT=$(git rev-parse --show-toplevel)

if [ $1 = "dev" ]; then
    tilt up --hud=TRUE
fi

if [ $1 = "down" ]; then
    tilt down
    exit 0
fi

if [ $1 = "test" ]; then
    ${GITROOT}/scripts/test.sh || exit 1
    # exit $?
    exit 0
fi

if [ $1 = "build" ]; then
    docker-compose build
    exit 0
fi