import { MercuriosClient } from "./client";
export { PublishOptions } from "./client";

export default {
    connect({ url, id }: { url: string; id?: string }): MercuriosClient {
        return new MercuriosClient(url, id);
    },
};
