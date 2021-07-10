import fastify from "fastify";

let app = fastify({});

app.route({
    method: "GET",
    url: "/",
    handler: async (req, res) => {
        return res.send({ foo: "bar" });
    },
});

app.listen(3000, "0.0.0.0", () => {
    console.log(`server running`);
});
