clear
docker-compose down
docker-compose up -d mysql
sleep 10
docker-compose up -d
docker-compose logs -f server