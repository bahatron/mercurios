import moment from "moment";
import { AxiosError } from "axios";
import { EventEmitter } from "events";

export const green = (text: string) => `\x1b[32m${text}\x1b[0m`;
export const cyan = (text: string) => `\x1b[96m${text}\x1b[0m`;
export const orange = (text: string) => `\x1b[33m${text}\x1b[0m`;
export const red = (text: string) => `\x1b[31m${text}\x1b[0m`;

export function log(text: string, colour: Function, level: string) {
    let timestamp = moment().format("YYYY-MM-DD HH:mm:ss:SSS");

    console.log(
        `${timestamp} ${`[${process.pid}]`.padEnd(5)} ${colour(
            level.padEnd(8)
        )}- ${text}`
    );
}

export function inspect(context: any = {}) {
    Object.entries(context || {}).forEach(([key, value]) => {
        console.log(`${cyan(key)}: `, value);
    });
}

export function dd(message: string, context?: any) {
    $logger.debug(message, context);
    process.exit(-25);
}

class Logger extends EventEmitter {
    constructor(private readonly _debug: boolean) {
        super();
    }

    public debug(message: string, context?: any): void {
        if (this._debug) {
            log(message, cyan, "DEBUG");
            inspect(context);
            this.emit("debug");
        }
    }

    public info(message: string) {
        log(message, green, "INFO");
        this.emit("info");
    }

    public warning(message: string, context?: any) {
        log(message, orange, "WARNING");
        inspect(context);
        this.emit("warning");
    }

    public error(err: AxiosError | Error | any) {
        log(err.message, red, "ERROR");
        inspect(
            err && err.response
                ? {
                      req: err.response.config,
                      response: err.response.data,
                  }
                : err
        );
        this.emit("error");
    }
}

type LoggerType = Logger;
export { LoggerType as Logger };

export function loggerFactory(_debug = true) {
    return new Logger(_debug);
}

const $logger = loggerFactory();

export default $logger;
