docker-compose -f docker-compose.test.yml down
docker-compose -f docker-compose.test.yml up -d mysql
echo "waiting for mysql db to start..."
# sleep 30
docker-compose -f docker-compose.test.yml up -d
docker-compose -f docker-compose.test.yml exec server npm run test || exit 1
docker-compose -f docker-compose.test.yml exec server npm run test:benchmark