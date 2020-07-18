import { AxiosError } from "axios";

class MercuriosError extends Error {
    constructor(
        public readonly message: string,
        public readonly context?: Record<string, any>,
        public readonly code?: string | number
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

        throw new MercuriosError(
            err.message,
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
};
