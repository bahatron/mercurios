import { AxiosError } from "axios";

const WS_CONNECTION_ERROR = "WS_CONNECTION_ERROR";
class MercuriosError extends Error {
    constructor(
        public readonly message: string,
        public readonly code: string,
        public readonly context?: Record<string, any>,
        public readonly httpCode: number = 500
    ) {
        super();
        this.name = "MercuriosError";
    }
}

export const $error = {
    HttpError(err?: AxiosError) {
        if (!err?.isAxiosError) {
            throw err;
        }

        return new MercuriosError(
            err.message,
            "HTTP_ERROR",
            {
                req_config: {
                    url: err.config?.url,
                    method: err.config?.method,
                    headers: err.config?.headers,
                    data: err.config?.data,
                },
                res_status: err.response?.status,
                res_data: err.response?.data,
            },
            err.response?.status
        );
    },

    ConnectionError(message: string, context = {}) {
        return new MercuriosError(message, WS_CONNECTION_ERROR, context);
    },
};
