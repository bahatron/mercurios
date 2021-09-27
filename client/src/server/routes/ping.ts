import { asyncRoute } from "../middleware/async-route";

export const pingController = asyncRoute(async (req, res) => {
    return res.json("pong");
});
