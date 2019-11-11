docker-compose down
docker-compose -f docker-compose.test.yml up --abort-on-container-exit  || exit 1