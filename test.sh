docker-compose -f docker-compose.test.yml down
docker-compose -f docker-compose.test.yml up -d
docker-compose -f docker-compose.test.yml exec server sh -c "wait-for-it localhost:4254 -- npm run test" || exit 1
docker-compose -f docker-compose.test.yml exec server npm run test:benchmark -- -d 30 --ping --write --competing --read