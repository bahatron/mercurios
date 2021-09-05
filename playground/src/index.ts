import fastify from "fastify";

let server = fastify();

server.route({
    method: "GET",
    url: "/ping",
    handler: async (req, res) => {
        return res.send("pong");
    },
});

server.listen(4254, "0.0.0.0", () => {
    console.log(`playground server listening`);
});
