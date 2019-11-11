const $json = {
    parse(data: any) {
        try {
            return JSON.parse(data);
        } catch (err) {
            return data;
        }
    },

    /** @todo: add recursive behaviour */
    stringify(data: any, replacer?: (key, value) => any, spaces: number = 4) {
        return typeof data === "string"
            ? data
            : JSON.stringify(data, replacer, spaces);
    },
};

export default $json;
