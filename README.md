# Mercurios

HTTP based event sourcing and message broker

## Notes

-   Event ordering is not guaranteed. However, it's possible to use `expectedSeq` when publishing to control the order of events in a stream
-   Event data is hard capped to 1mb (for AWS multi-master compatability)

## DEV environment

**Dependencies**:

-   node:12+
    -   [Windows / MacOs](https://nodejs.org/en/download/)
    -   [Debian based Linux](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-20-04)
-   docker
-   docker-compose
-   [tilt](https://docs.tilt.dev/install.html)

### Starting the derv environment

-   run.js

```sh
    ## IMPORTANT: it most be run before the first start of the application
    ./run.js setup

    # start dev environment
    ./run.js up

    # tests services; -b will build images before tests
    ./run.js test -b
```

-   navigate to localhost:4250 in your browser for playground UI

## ENV variables

```sh
# mysql config if using mysql driver
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USERNAME=root
MYSQL_PASSWORD=secret
MYSQL_DATABASE=mercurios
# only necessary for AWS RDS SSL connectivity - values 1|any
MYSQL_RDS_SSL=0

# pg config if using pg driver
POSTGRES_PASSWORD: secret
POSTGRES_DB: mercurios
POSTGRES_USER: admin
POSTGRES_PORT: 5432
POSTGRES_HOST: postgres

# nats config
NATS_URL=nats://nats:4222

# optional, true|1|any
MERCURIOS_DEBUG=1

# optional, number, default 30000
MERCURIOS_PING_INTERVAL=30000

# chose the storage option, options: pg|mysql default: mysql
MERCURIOS_DRIVER=mysql

# workers, values: number|"max" default 1; max will create as many workers as the cpu cores
MERCURIOS_WORKERS=1

# optional, server url for tests
MERCURIOS_TEST_URL=http://localhost:4254

# optional, swagger doc page
MERCURIOS_SWAGGER=1
```

## testing

```sh
# ci testing using docker-compose
scripts/test.sh

# run benchmark
scripts/benchmark.sh
```
