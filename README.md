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
NATS_URRL=nats://nats:4222

# starts server in debug mode
DEBUG=false

# sets the amount of workers
PROCESSES=2

# server url for tests
TEST_SERVER_URL=http://localhost:3000
```

## API

### `POST /streams`

Creates a stream

-   **Params**:

    -   topic\*: stream name, must be unique
    -   schema?: [jsonschema](https://github.com/tdegrunt/jsonschema)

-   **Example**:
    ```ts
    axios.post<Stream>(`${API_URL}/streams`, {
        topic: "topic_name",
        schema: {
            type: "object",
            properties: {
                foo: {
                    type: "string",
                },
            },
        },
    });
    ```

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
