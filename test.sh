docker-compose -f docker-compose.test.yml down
docker-compose build || exit 1
docker-compose -f docker-compose.test.yml up -d mysql
sleep 10
docker-compose -f docker-compose.test.yml up --abort-on-container-exit  || exit 1