# Mercurious

HTTP based event streaming

## Notes

-   Event ordering is not guaranteed. However, it's possible to use `expectedSeq` when publishing to control the order of events in a stream

## Scripts

```sh
# build server image
./build.sh

# run server tests
./test.sh

# setup dev environment
./dev:setup.sh

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

# optional, production|any
MERCURIOS_ENV=dev

# optional, sets the amount of workers, default: "max"
MERCURIOS_WORKERS=2

# optional, sets the logger id
MERCURIOS_LOGGER_ID=my_mercurios_instance

# optional, server url for tests
MERCURIOS_TEST_URL=http://localhost:3000
```

## API

### `POST /stream/:topic`

Publishes an event to the stream

-   **Query**:

    -   topic: the topic of the stream

-   **Params**:

    -   data?: event payload
    -   expectedSeq?: the new event's expected sequence

-   **Example**:
    ```ts
    axios.post<Event>(`${API_URL}/stream/my_topic`, {
        data: {
            foo: "bar",
        },
    });
    ```

### `GET /stream/:topic/:seq`

Read event

-   **Query**:

    -   topic: the topic of the stream
    -   seq: event sequence

-   **Example**:
    ```ts
    axios.get<Event>(`${API_URL}/stream/my_topic/2`);
    ```

### `GET /ping`

Check HTTP server status

-   **Example**:
    ```ts
    axios.get<"pong">(`${API_URL}/ping`);
    ```
