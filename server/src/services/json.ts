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
        replacer?: (key: any, value: any) => any,
        spaces: number = 4
    ) {
        return typeof data === "string"
            ? data
            : JSON.stringify(data, replacer, spaces);
    },
};

export default $json;
