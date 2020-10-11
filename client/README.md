```ts
// connect to server
let mercurios = $mercurios.connect({ url: "http://mercurios:4254" });

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
