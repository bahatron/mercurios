import { MercuriosClient } from "./client";

describe("Mercurios Client", () => {
    let _client = MercuriosClient(process.env.MERCURIOS_URL || "");

    it("can publish events", async () => {
        return new Promise(async (resolve) => {
            let testData = { rick: "sanchez" };

            let event = await _client.publish("test_publish", {
                data: testData,
            });

            expect(event).toBeTruthy();
            expect(event.seq).toBeTruthy();
            expect(event.data).toEqual(testData);

            resolve();
        });
    });

    it("can emit events", async () => {
        return new Promise(async (resolve) => {
            let testData = { morty: "smith" };

            let event = await _client.emit("test_emit", { data: testData });

            expect(event).toBeTruthy();
            expect(event.seq).toBeFalsy();
            expect(event.data).toEqual(testData);

            resolve();
        });
    });

    it("can read events", async () => {
        // todo
    });

    it("can subscribe to topics", async () => {
        // todo
    });

    it("can unsubscribe to topics", async () => {
        // todo
    });
});
