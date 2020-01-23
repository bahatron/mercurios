clear
docker-compose down
docker-compose up -d mysql
sleep 5
docker-compose up --abort-on-container-exit