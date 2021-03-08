import { Logger } from "@bahatron/utils";

export const $logger = Logger({
    debug: process.env.MERCURIOS_DEV === "1",
    id: `mercurios-client`,
    pretty: false,
    formatter: (entry) => entry,
});
