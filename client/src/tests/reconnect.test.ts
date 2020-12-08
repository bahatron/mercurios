import { connect } from "..";

describe("Reconnect behaviour", () => {
    let client = connect({
        url: process.env.MERCURIOS_URL || "",
        id: "reconnect_test",
    });

    client.socket.on("force_reconnect", async () => {
        if (client.socket.isOpen()) {
            await client.socket.close();
            console.log(`client closed...`);
        }
    });

    it("will reconnect", () => {
        return new Promise(async (resolve) => {
            client.subscribe("hello", () => {
                resolve();
            });

            await client.socket.emit("force_reconnect");
            await new Promise((resolve) => setTimeout(resolve, 100));
            await client.emit("hello");
        });
    });
});
