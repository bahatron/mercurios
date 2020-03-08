type HttpCode = 400 | 401 | 403 | 404 | 409 | 417 | 500;
type Context = Record<string, any>;

class HttpError extends Error {
    constructor(
        public readonly name: string,
        public readonly message: string,
        public readonly httpCode: HttpCode,
        public readonly context: Context = {}
    ) {
        super();
    }
}

const $error = {
    InternalError(
        message: string = "Interal Error",
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

    Conflict(message: string = "Conflict", context?: Context): HttpError {
        return new HttpError("Conflict", message, 409, context);
    },

    Unauthorized(
        message: string = "Unauthorized Request",
        context?: Context
    ): HttpError {
        return new HttpError("Unauthorized", message, 401, context);
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

    Error(message: string, httpCode: HttpCode, context?: Context): HttpError {
        return new HttpError("Error", message, httpCode, context);
    },
};

type ErrorType = HttpError;
export { ErrorType as HttpError };

export default $error;
