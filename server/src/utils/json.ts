import $logger from "./logger";

const isStringifiable = (data: any) => {
    return ["object", "function"].includes(typeof data) || Array.isArray(data);
};

export const $json = {
    parse(data: any) {
        try {
            return typeof data === "string" ? JSON.parse(data) : data;
        } catch (err) {
            // $logger.warning("JSON.parse error", { data, error: err });
            return data;
        }
    },

    stringify(data: any): string {
        return isStringifiable(data) ? JSON.stringify(data) : data?.toString();
    },
};

export default $json;
