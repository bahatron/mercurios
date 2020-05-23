import { ErrorCode } from "ts-nats";

type Context = Record<string, any>;

export class HttpError extends Error {
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
    ): HttpError {
        return new HttpError("InternalError", message, 500, context);
    },

    ValidationFailed(
        message: string = "Validation Failed",
        context?: Context
    ): HttpError {
        return new HttpError("ValidationFailed", message, 400, context);
    },

    BadRequest(message: string = "Bad Request", context?: Context): HttpError {
        return new HttpError("BadRequest", message, 400, context);
    },

    NotFound(
        message: string = "Resource not found",
        context?: Context
    ): HttpError {
        return new HttpError("NotFound", message, 404, context);
    },

    ExpectationFailed(
        message: string = "Expectation Failed",
        context?: Context
    ): HttpError {
        return new HttpError("ExpectationFailed", message, 417, context);
    },

    NotImplemented(
        message: string = "Not Implemented",
        context?: Context
    ): HttpError {
        return new HttpError("NotImplemented", message, 501, context);
    },
};

export default $error;
