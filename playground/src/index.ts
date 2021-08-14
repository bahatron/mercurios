import mercurios from "../../client/lib";
import fastify from "fastify";

let client = mercurios.connect({
    url: process.env.MERCURIOS_URL || "http://localhost:4254",
    debug: true,
});

let server = fastify();

server.route({
    method: "GET",
    url: "/subscribe/:topic",
    handler: async (req, res) => {
        console.log(req.params);

        await client.subscribe((req.params as any).topic, (msg) => {
            console.log(msg);
        });

        return res.send();
    },
});

server.listen(4250, "0.0.0.0", () => {
    console.log(`playground server listening`);
});
