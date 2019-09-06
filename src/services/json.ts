const $json = {
    parse(data: any) {
        try {
            return JSON.parse(data);
        } catch (err) {
            return data;
        }
    },

    stringify(data: any) {
        return typeof data === "string" ? data : JSON.stringify(data);
    }
};

export default $json;
