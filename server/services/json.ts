const $json = {
    parse(data: any) {
        try {
            return JSON.parse(data);
        } catch (err) {
            return data;
        }
    },

    stringify(
        data: any,
        options: {
            replacer?: (key: any, value: any) => any;
            spaces?: number;
        } = {}
    ) {
        return typeof data === "string"
            ? data
            : JSON.stringify(data, options.replacer, options.spaces);
    },
};

export default $json;
