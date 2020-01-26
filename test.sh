docker-compose -f docker-compose.test.yml down
docker-compose -f docker-compose.test.yml up -d mysql
sleep 20
docker-compose -f docker-compose.test.yml up --abort-on-container-exit  || exit 1