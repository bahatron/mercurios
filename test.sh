docker-compose -f docker-compose.test.yml down
docker-compose -f docker-compose.test.yml up -d mysql
sleep 15
docker-compose -f docker-compose.test.yml up --abort-on-container-exit tests  || exit 1