import { Logger } from "@bahatron/utils";

export const $logger = Logger({
    debug: process.env.MERCURIOS_DEBUG === "1",
    id: "mercurios_client",
    pretty: process.env.MERCURIOS_DEV === "1",
});
