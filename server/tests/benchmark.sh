#!/bin/sh

curl -X POST -H "Content-Type: application/json" -d '{"topic":"perf_test"}' http://server:3000/streams

echo \

# test http server capacity
autocannon -c 100 server:3000/ping

# test publishing events
# curl -X POST -H "Content-Type: application/json" -d '{"data":{}}' http://server:3000/stream/perf_test
autocannon -c 100 -m POST -H "Content-Type: application/json" -b '{}' http://server:3000/stream/perf_test

# test reading events
autocannon -c 100 http://server:3000/stream/perf_test/1

# sequential tes
npx ts-node /app/tests/test_sequential_insert.ts