import mercurios from "@bahatron/mercurios";

async function main() {
    let client = mercurios.connect({
        url: process.env.MERCURIOS_URL || "http://localhost:4254",
        debug: true,
    });

    client.subscribe("heartbeat", async msg => {
        console.log(`================== got heartbeat`);
    });
}

main();
