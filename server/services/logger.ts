import $env from "@bahatron/env";
import moment from "moment";

const DEBUG = $env.get("DEBUG", "");

const DEBUG_MODE = DEBUG === "false" ? false : Boolean(DEBUG);

const green = (text: string) => `\x1b[32m${text}\x1b[0m`;
const cyan = (text: string) => `\x1b[96m${text}\x1b[0m`;
const orange = (text: string) => `\x1b[33m${text}\x1b[0m`;
const red = (text: string) => `\x1b[31m${text}\x1b[0m`;

function log(text: string, colour: Function, level: string) {
    let timestamp = moment().format("YYYY-MM-DD HH:mm:ss");

    let message = `${timestamp}: [${process.pid}] ${colour(
        level.padEnd(9)
    )} ${text}`;

    console.log(message);
}

const $logger = {
    debug(message: string, context?: object): void {
        if (!DEBUG_MODE) {
            return;
        }

        log(message, cyan, "DEBUG");

        Object.entries(context || {}).forEach(([key, value]) => {
            console.log(`${key}: `, value);
        });
    },

    info(message: string) {
        log(message, green, "INFO");
    },

    warning(message: string, context?: any) {
        log(message, orange, "WARNING");
    },

    error(message: string, err?: any) {
        log(message, red, "ERROR");
    },
};

export default $logger;
