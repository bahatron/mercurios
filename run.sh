#!/bin/bash

export GITROOT=$(git rev-parse --show-toplevel)

execute_build()
{
    docker-compose -f ${GITROOT}/docker-compose.yml build --parallel || exit 1
    execute_shutdown
}

execute_shutdown()
{
    tilt down
    docker-compose -f ${GITROOT}/docker-compose.yml down --remove-orphans
    docker-compose -f ${GITROOT}/docker-compose.test.yml down --remove-orphans
}

if [ $1 = "up" ]; then
    if [ $2 = "-c" ]; then
        execute_shutdown
    fi

    tilt up --hud=TRUE
    execute_shutdown
    exit 0
fi

if [ $1 = "down" ]; then
    execute_shutdown
fi

if [ $1 = "build" ]; then
    echo "building images..."
    execute_build
    exit 0
fi

if [ $1 = "test" ]; then
    if [ ${2} = "-b" ]; then
        execute_build
    fi
    
    ${GITROOT}/scripts/test.sh || exit 1
    # exit $?
    exit 0
fi