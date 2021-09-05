#!/usr/bin/env bash

set -m
set +e



cmd="mongod --bind_ip_all --port $MONGO_DB_HOST_PORT --replSet $MONGO_DB_REPLICA_SET_NAME --quiet"

$cmd &

jobs

if ! [ -f ../initialised ]; then

    while [[ $(mongo --host $MONGO_DB_HOST_NAME --eval "print(\"waited for connection\")" --quiet) != "waited for connection" ]]; do
        sleep 1
    done


    mongo --eval "rs.initiate({ _id : '$MONGO_DB_REPLICA_SET_NAME', members: [{ _id: 0, host: '$MONGO_DB_HOST_NAME:$MONGO_DB_HOST_PORT' }]})" --quiet

    while [ $(mongo --eval "rs.status().ok" --quiet) -ne 1 ]; do
        sleep 1
    done


    touch ../initialised

    echo "Replica set setup successfully as ${MONGO_DB_REPLICA_SET_NAME}"
fi

fg %1
