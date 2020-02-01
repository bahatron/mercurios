import moment from "moment";
import { AxiosError } from "axios";
import $config from "./config";

const DEBUG_MODE = $config.DEV_MODE;

export const green = (text: string) => `\x1b[32m${text}\x1b[0m`;
export const cyan = (text: string) => `\x1b[96m${text}\x1b[0m`;
export const orange = (text: string) => `\x1b[33m${text}\x1b[0m`;
export const red = (text: string) => `\x1b[31m${text}\x1b[0m`;

function log(text: string, colour: Function, level: string) {
    let timestamp = moment().format("YYYY-MM-DD HH:mm:ss:SSS");

    console.log(
        `${timestamp} ${`[${process.pid}]`.padEnd(5)} ${colour(
            level.padEnd(8)
        )}- ${text}`
    );
}

function inspect(context: any = {}) {
    Object.entries(context || {}).forEach(([key, value]) => {
        console.log(`${cyan(key)}: `, value);
    });
}

const $logger = {
    debug(message: string, context?: any): void {
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

    warning(message: string, context?: any) {
        log(message, orange, "WARNING");
        inspect(context);
    },

    error(message: string, err?: AxiosError | Error | any) {
        log(message, red, "ERROR");
        inspect(err && err.response ? err.response.config : err);
    },

    inspect,
};

export default $logger;
