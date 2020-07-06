# Mercurios

HTTP based event bus

## Notes

-   Event ordering is not guaranteed. However, it's possible to use `expectedSeq` when publishing to control the order of events in a stream

## dev mode

### using tilt:

> https://docs.tilt.dev/install.html

-   instal tilt:

```sh
    curl -fsSL https://raw.githubusercontent.com/tilt-dev/tilt/master/scripts/install.sh | bash
```

-   run tilt:

```sh
    # start app
    tilt up

    # tear down dev env
    tilt down
```

### using docker-compose:

```sh
    # no volume mapping
    docker-compose up
```

## ENV variables

```sh
# mysql config if using mysql driver
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USERNAME=root
MYSQL_PASSWORD=secret
MYSQL_DATABASE=mercurios

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

# optional, sets the amount of workers, default: "max"
MERCURIOS_WORKERS=2

# chose the storage option, ooptions: pg|mysql_multitable
MERCURIOS_DRIVER=mysql_multitable

# optional, server url for tests
MERCURIOS_TEST_URL=http://localhost:3000
```

## testing

```sh
# ci testing using docker-compose
scripts/test.sh
```
