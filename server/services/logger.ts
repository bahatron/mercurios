import $env from "@bahatron/env";
import moment from "moment";

const DEBUG = $env.get("DEBUG", "");

/** @todo: review needed; particullary because it execpts package.json to set ENV var */
/** @todo: formalize debug mode; refactor logger to exose constructor function */
const DEBUG_MODE =
    DEBUG === "false"
        ? false
        : Boolean(DEBUG) && Boolean($env.get("ENV", "") !== "test");

export const green = (text: string) => `\x1b[32m${text}\x1b[0m`;
export const cyan = (text: string) => `\x1b[96m${text}\x1b[0m`;
export const orange = (text: string) => `\x1b[33m${text}\x1b[0m`;
export const red = (text: string) => `\x1b[31m${text}\x1b[0m`;

function log(text: string, colour: Function, level: string) {
    let timestamp = moment().format("YYYY-MM-DD HH:mm:ss:SSS");

    console.log(
        `${timestamp} [${process.pid}] ${colour(level.padEnd(9))}- ${text}`
    );
}

function inspect(context: any = {}) {
    if (!DEBUG_MODE) {
        return;
    }

    Object.entries(context || {}).forEach(([key, value]) => {
        console.log(`${cyan(key)}: `, value);
    });
}

const $logger = {
    debug(message: string, context?: object | any[]): void {
        if (!DEBUG_MODE) {
            return;
        }

        log(message, cyan, "DEBUG");
        inspect(context);
    },

    dd(message: string, context?: any) {
        $logger.debug(message, context);
        process.exit(-25);
    },

    info(message: string) {
        log(message, green, "INFO");
    },

    warning(message: string, context?: object | any[]) {
        log(message, orange, "WARNING");
        inspect(context);
    },

    error(message: string, err?: any) {
        log(message, red, "ERROR");
        inspect(err && err.response ? err.response.config : err);
    },
};

export default $logger;
