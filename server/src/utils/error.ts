import { ErrorCode } from "ts-nats";

type Context = Record<string, any>;

export class Exception extends Error {
    constructor(
        public readonly name: string,
        public readonly message: string,
        public readonly httpCode: number,
        public readonly context: Context = {}
    ) {
        super();
    }
}

export const ERROR_CODES = {
    STREAM_NOT_FOUND: "ERR_NOSTREAM",
    EVENT_NOT_FOUND: "ERR_NOEVENT",
    UNEXPECTED_ERROR: "ERR_UNEXPECTED",
};

const $error = {
    InternalError(
        message: string = "Internal Error",
        context?: Context
    ): Exception {
        return new Exception("InternalError", message, 500, context);
    },

    ValidationFailed(
        message: string = "Validation Failed",
        context?: Context
    ): Exception {
        return new Exception("ValidationFailed", message, 400, context);
    },

    BadRequest(message: string = "Bad Request", context?: Context): Exception {
        return new Exception("BadRequest", message, 400, context);
    },

    NotFound(
        message: string = "Resource not found",
        context?: Context
    ): Exception {
        return new Exception("NotFound", message, 404, context);
    },

    ExpectationFailed(
        message: string = "Expectation Failed",
        context?: Context
    ): Exception {
        return new Exception("ExpectationFailed", message, 417, context);
    },

    NotImplemented(
        message: string = "Not Implemented",
        context?: Context
    ): Exception {
        return new Exception("NotImplemented", message, 501, context);
    },

    Error(
        message: string = "Validation Failed",
        code: number,
        context?: Context
    ): Exception {
        return new Exception("Exception", message, code, context);
    },
};

export default $error;
