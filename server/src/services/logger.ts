import winston from "winston";
import $env from "@bahatron/env";

const DEBUG = $env.get("DEBUG", "");

const DEBUG_MODE = DEBUG === "false" ? false : Boolean(DEBUG);

const $logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD hh:mm:ss" })
    ),
    transports: [
        new winston.transports.Console({
            level: DEBUG_MODE ? "debug" : "info",
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.align(),
                winston.format.prettyPrint(),
                winston.format.printf(info => {
                    let message = `${info.timestamp} [${process.pid}] ${info.level}: ${info.message}`;

                    if (info.level.includes("debug")) {
                        Object.entries(info).forEach(([key, value]) => {
                            if (
                                !["level", "timestamp", "message"].includes(key)
                            ) {
                                console.log(key ? `${key}: ` : "", value);
                            }
                        });
                    }

                    return message;
                })
            ),
        }),
    ],
});

export default $logger;
