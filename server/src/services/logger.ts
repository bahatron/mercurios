import winston from "winston";
import $env from "@bahatron/env";
import $json from "./json";
import { isEmpty } from "lodash";

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
                        let context = Object.getOwnPropertyNames(info)
                            .filter(
                                key =>
                                    !["level", "timestamp", "message"].includes(
                                        key
                                    )
                            )
                            .map(key => `\n${$json.stringify(info[key])}`)
                            .reduce((_context, stringified) => {
                                _context += stringified;
                                return _context;
                            }, "");

                        return isEmpty(context)
                            ? message
                            : `${message}${context}`;
                    }

                    return message;
                })
            ),
        }),
    ],
});

export default $logger;
