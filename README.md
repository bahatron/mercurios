# Mercurios

HTTP based event sourcing

## Notes

-   Event ordering is not guaranteed. However, it's possible to use `expectedSeq` when publishing to control the order of events in a stream

## Scripts

```sh
# build server image
./build.sh

# run server tests
./test.sh

# start dev environment
./dev.sh
```

## ENV variables

```sh
# mysql config
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USERNAME=root
MYSQL_PASSWORD=secret
MYSQL_DATABASE=mercurios

# nats config
NATS_URL=nats://nats:4222

# optional, true|1|any
MERCURIOS_DEBUG=1

# optional, sets the amount of workers, default: "max"
MERCURIOS_WORKERS=2

# needed for redis_lock driver
REDIS_HOST=redis

# chose the storage option, ooptions: mysql_myisam(does not support expectedSeq checks), mysql_multitable, redis_lock
MERCURIOS_DRIVER=mysql_multitable

# optional, server url for tests
MERCURIOS_TEST_URL=http://localhost:3000
```

## API

### `POST /publish/:topic`

Publishes an event to the stream

-   **Query**:

    -   topic: the topic of the stream

-   **Params**:

    -   data?: event payload
    -   expectedSeq?: the new event's expected sequence

-   **Example**:
    ```ts
    axios.post<MercuriosEvent>(`${API_URL}/publish/my_topic`, {
        data: {
            foo: "bar",
        },
    });
    ```

### `POST /emit/:topic`

Emits an event without persisting it

-   **Example**:
    ```ts
    axios.post<MercuriosEvent>(`${API_URL}/emit/my_topic`, {
        data: {
            foo: "bar",
        },
    });
    ```

### `GET /read/:topic/:seq`

Read event

-   **Query**:

    -   topic: the topic of the stream
    -   seq: event sequence

-   **Example**:
    ```ts
    axios.get<MercuriosEvent>(`${API_URL}/read/my_topic/2`);
    ```

### `GET /ping`

Check HTTP server status

-   **Example**:
    ```ts
    axios.get<"pong">(`${API_URL}/ping`);
    ```
