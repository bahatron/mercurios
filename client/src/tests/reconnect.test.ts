import { connect } from "..";

describe.skip("Reconnect behaviour", () => {
    let client = connect({
        url: process.env.MERCURIOS_URL || "",
        id: "reconnect_test",
    });

    client.socket.on("force_reconnect", async () => {
        if (client.socket.isOpen()) {
            await client.socket.close();
        }
    });

    it("will reconnect", async (done) => {
        client.subscribe("hello", () => {
            done();
        });

        await client.socket.emit("force_reconnect");
        await new Promise((resolve) => setTimeout(resolve, 100));
        await client.emit("hello");
    });
});
