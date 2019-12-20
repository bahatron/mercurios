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
        replacer?: (key: string, value: any) => any,
        spaces: number = 4
    ): string {
        switch (data) {
            case typeof data === "string":
                return data;
            // case Array.isArray(data):
            //     return (data as any[])
            //         .map((entry: any) =>
            //             $json.stringify(entry, replacer, spaces)
            //         )
            //         .join("\n");
            default:
                return JSON.stringify(data, replacer, spaces);
        }
    },
};

export default $json;
