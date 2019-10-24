# Mercurious

Event streaming made simple

## Getting started

- `npm run docker:dev`: orchestrate the development environment
- `npm run docker:build`: build the server's image
- `npm run docker:test`: test server's image
- `npm run start`: start server in production mode
- `npm run start:dev`: start server in developmnet mode
- `npm run build`: compile typescript files
- `npm run build:watch`: execute watch mode for typescript files
- `npm run test`: execute unit tests (requites enviroment to be set)
- `npm run test:perf`: execute performance test

## Notes

 - Event ordering is not guaranteed. However, it's possible to use `expectedSeq` when publishing to control the order of events in a stream


## API

### `POST /streams`

Creates a stream

- **Params**:
  - topic*: stream name, must be unique
  - schema?: [jsonschema](https://github.com/tdegrunt/jsonschema)

- **Example**:
    ```ts
    $axios.post<Stream>(`${API_URL}/streams`, {
        topic: "topic_name",
        schema: {
            type: "object",
            properties: {
                foo: {
                    type: "string"
                }
            }
        }
    });
    ```

### `POST /stream/:topic`

Publishes an event to the stream

- **Query**:
  - topic: the topic of the stream

- **Params**:
  - data?: event payload
  - expectedSeq?: the new event's expected sequence

- **Example**:
    ```ts
    $axios.post<Event>(`${API_URL}/stream/my_topic`, {
        data: {
            foo: "bar"
        }
    });
    ```

### `GET /stream/:topic/:seq`

Read event

- **Query**:
  - topic: the topic of the stream
  - seq: event sequence

- **Example**:
    ```ts
    $axios.get<Event>(`${API_URL}/stream/my_topic/2`);
    ```

### `GET /ping`

 Check HTTP server status

- **Example**:
    ```ts
    $axios.get<"pong">(`${API_URL}/ping`);
    ```
