import winston, { LeveledLogMethod, LogCallback } from "winston";
import $env from "@bahatron/env";
import $json from "./json";

const DEBUG_MODE = $env.get("DEBUG_MODE", "") || false;

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
                    if (info.level.includes("debug")) {
                        let context = Object.getOwnPropertyNames(info)
                            .filter(
                                attr =>
                                    !["level", "timestamp", "message"].includes(
                                        attr
                                    )
                            )
                            .reduce((previous: Record<string, any>, value) => {
                                previous[value] = info[value];

                                return previous;
                            }, {});

                        return `${info.timestamp}: [${info.level}]: ${
                            info.message
                        }:\n${$json.stringify(context)}`;
                    }

                    return `${info.timestamp}: [${info.level}]: ${info.message}`;
                })
            ),
        }),
    ],
});

// export interface Logger extends winston.Logger {
//     debug(message: string, meta: any, callback: LogCallback): Logger;
// }

export default $logger;
