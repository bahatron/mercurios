import { Error } from "@bahatron/utils";

export const ERROR_CODES = {
    STREAM_NOT_FOUND: "ERR_NOSTREAM",
    EVENT_NOT_FOUND: "ERR_NOEVENT",
    UNEXPECTED_ERROR: "ERR_UNEXPECTED",
};

export const $error = Error;

export default $error;
