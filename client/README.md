```ts
// connect to server
import { connect } from "@bahatron/mercurios";

let mercurios = connect({ url: "http://mercurios:4254" });

// subscribe to a topic
await mercurios.subscribe("123", (msg) => {
    console.log(`recieved a message! \n`, msg);
});

// publish to a topic
await mercurios.publish("123", {
    data: { rick: "sanchez" },
    expectedSeq: 1,
    key: "example",
});

// emit event
await mercurios.emit("123", { data: { foo: "bar" } });

// close connection
await mercurios.close();
```
