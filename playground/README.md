```ts
// connect to server
let mercurios = $mercurios.connect({
    url: process.env.MERCURIOS_TEST_URL || "",
});

// subscribe to a topic
await mercurios.subscribe("123", (event) => {
    console.log(`recieved event! \n`, event);
});

// publish to a topic
await mercurios.publish("123", { rick: "sanchez" });

// emit event
await mercurios.emit("123", { foo: "bar" });

// close connection
await mercurios.close();
```
