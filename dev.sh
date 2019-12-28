clear
docker-compose down
docker-compose up -d mysql || exit 1
docker-compose run server npm ci
docker-compose run server npm run build:clean
docker-compose up --abort-on-container-exit