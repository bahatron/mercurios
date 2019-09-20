# Mercurious

Event streaming made simple

## Getting started

- run server in development mode: `npm run 

## API

### `POST /streams`

Creates a stream

- Params:
        topic*: stream name, must be unique,
        schema?: [jsonschema](https://github.com/tdegrunt/jsonschema)
- Example:
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

- Params:
    ```ts
        data?: event payload
    ```
- Example:
    ```ts
    $axios.post<Event>(`${API_URL}/stream/my_topic`, {
        data: {
            foo: "bar"
        }
    });
    ```

- GET /stream/:topic/:id

Read event

- Params:
    ```ts
    id: event sequence
    ```
- Example:
    ```ts
    $axios.get<Event>(`${API_URL}/stream/my_topic/2`);
    ```

### GET /ping

 Check HTTP status

- Example:
    ```ts
    $axios.get<"pong">(`${API_URL}/ping`);
    ```
