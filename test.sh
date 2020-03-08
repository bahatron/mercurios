docker-compose -f docker-compose.test.yml down
docker-compose -f docker-compose.test.yml up -d mysql
echo "waiting for mysql db to start..."
sleep 30
docker-compose -f docker-compose.test.yml up --abort-on-container-exit server_tests  || exit 1