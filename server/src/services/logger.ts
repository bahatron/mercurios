import winston from "winston";

const $logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD hh:mm:ss" })
    ),
    transports: [
        new winston.transports.Console({
            level: "debug",
            format: winston.format.combine(
                winston.format.colorize(),
                // winston.format.align(),
                winston.format.prettyPrint(),
                winston.format.printf(info => {
                    return `${info.timestamp}: [${info.level}]: ${info.message}`;
                })
            ),
        }),
    ],
});

export default $logger;
