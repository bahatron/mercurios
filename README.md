# Mercurios

Event sourcing simplified

## Notes

-   Event ordering is not guaranteed. However, it's possible to use `expectedSeq` when publishing to control the order of events in a stream

## Getting Started

```
npm install --save @bahatron/mercurios
```

```ts
import mercurios from "@bahatron/mercurios";

let client = mercurios.connect({ url: "postgres://postgres:5432" });

// appends an event to topic
let event = await client.append("myTopic", {
    data: { foo: "bar" },
    expectedSeq: 5,
});

// fetch an event by sequence
let event = await client.read("myTopic", 2);

// filter topic events
let events = await client.filter("myTopic", {
    from: 1,
    to: 5,
    before: "2021-09-01",
    key: "a_key",
});

// lists topics
let topics = await client.topics({
    like: "user.*",
    withEvents: {
        after: "2021",
    },
});
```

## Dev Environment

-   node:12+
    -   [Windows / MacOs](https://nodejs.org/en/download/)
    -   [Debian based Linux](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-20-04)
-   docker
-   docker-compose

```sh
npm install && npm run dev
```

## Migration from v2 to v3

-   Only Postgres Driver is available currently in v3
-   No need for HTTP server anymore, just npm install and code away!
-   NATS is no longer a dependency
-   Subscribing to topics is no longer possible
-   Emit event method removed
-   "publish" method renamed to "append"
-   Event data structure changes:
    -   published_at -> timestamp
