import $mercurios from "./index";

let mercurios = $mercurios.connect({ url: process.env.TEST_URL || "" });

async function main() {
    await mercurios.subscribe("123", (event) => {
        console.log(`recieved event! \n`, event);

        process.exit(0);
    });

    await mercurios.publish("123", { rick: "sanchez" });
}

main().catch((err) => {
    console.log(err);
    process.exit(-1);
});
