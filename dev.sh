clear
docker-compose down
docker-compose up -d mysql
docker-compose run server npm ci
docker-compose run server npm run build:clean
sleep 5
docker-compose up --abort-on-container-exit