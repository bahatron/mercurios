clear
docker-compose down
docker-compose up -d mysql || exit 1
sleep 10
docker-compose up --abort-on-container-exit