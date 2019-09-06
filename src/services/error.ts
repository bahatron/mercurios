/**
 * @todo: convert this into a NPM package
 */

type HttpCode = 400 | 401 | 403 | 404 | 409 | 500;
type Context = Record<string, any>;

class Exception extends Error {
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

    Unauthorized(
        message: string = "Unauthorized Request",
        context?: Context
    ): Exception {
        return new Exception("Unauthorized", message, 401, context);
    },

    Error(message: string, httpCode: HttpCode, context?: Context): Exception {
        return new Exception("Error", message, httpCode, context);
    }
};

type ExceptionType = Exception;
export { ExceptionType as Exception };

export default $error;
