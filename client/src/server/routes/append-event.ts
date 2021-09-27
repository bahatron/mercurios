import { asyncRoute } from "../middleware/async-route";

export const appendEventController = asyncRoute(async (req, res) => {
    return res.json();
});
