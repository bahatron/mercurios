import mercurios, { PublishOptions } from "./index";

let client = mercurios.connect({ url: "http://server:4254", id: "playground" });

let _topic = "example topic";

async function main() {
    async function subscribe() {
        await client.subscribe(_topic, (event) => {
            console.log(`sub: 1, topic: ${event.topic}, seq: ${event.seq}`);
        });
        await client.subscribe(_topic, (event) => {
            console.log(`sub: 2, topic: ${event.topic}, seq: ${event.seq}`);
        });
    }

    await subscribe();
    let counter = 1;
    let interval = setInterval(async () => {
        if (!(counter % 4)) {
            console.log(`subscribing...`);
            await subscribe();
        } else if (!(counter % 5)) {
            console.log(`unsubscribing...`);
            await client.unsubscribe("example topic");
        }

        if (counter === 15) {
            console.log(`closing...`);
            await client.close();
        }

        await client.publish("example topic");
        console.log(`published to example topic - count = ${counter}`);
        counter++;
    }, 2000);
}

main().catch((err) => {
    console.error(err);
    process.exit(-1);
});
