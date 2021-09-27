import { Logger } from "@bahatron/utils/lib/logger";

export const requestLogger = (logger: Logger) => (req, res, next) => {
    let timestamp = process.hrtime.bigint();

    function requestTime() {
        let diff = process.hrtime.bigint();

        return parseFloat(
            ((diff - timestamp) / BigInt(1000000)).toString()
        ).toPrecision(4);
    }

    res.once("close", () => {
        logger.info(
            `${req.method} ${req.url} - ${res.statusCode} - ${requestTime()}ms`
        );
    });
    next();
};
