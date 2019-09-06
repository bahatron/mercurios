# Mercurious

> event and data streaming made simple

## Getting started

-   run `npm run docker:dev`
-   done!

# API

### POST /streams

> Create stream

_topic<string>_\*: stream's name, must be unique
_schema(optional)<object>_: jsonschema Schema

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

### POST/stream/:topic

> Publish event

_data(optional)<object>_: event's payload

```ts
$axios.post<Event>(`${API_URL}/stream/my_topic`, {
    data: {
        foo: "bar"
    }
});
```

### GET/stream/:topic/:seq

> Get event

_seq<number>\*_: event position on the stream

```ts
$axios.get<Event>(`${API_URL}/stream/my_topic/2`);
```

### GET/ping

> Check HTTP status

```ts
$axios.get<"pong">(`${API_URL}/ping`);
```
