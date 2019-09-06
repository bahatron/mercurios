# Mercurious

> event and data streaming made simple

## Getting started

-   run `npm run docker:dev`
-   done!

## API

### POST /streams

Create stream

##### Params:
    - topic*: stream name, must be unique
    - schema?: [jsonschema](https://github.com/tdegrunt/jsonschema)
##### Example:
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

### POST /stream/:topic

> Publish event

##### Params:
    - data?: event's payload
##### Example:
```ts
$axios.post<Event>(`${API_URL}/stream/my_topic`, {
    data: {
        foo: "bar"
    }
});
```

### GET /stream/:topic/:seq

> Get event

##### Params:
    - seq: event's sequence
##### Example:
```ts
$axios.get<Event>(`${API_URL}/stream/my_topic/2`);
```

### GET /ping

> Check HTTP status
> 
##### Example:
```ts
$axios.get<"pong">(`${API_URL}/ping`);
```
