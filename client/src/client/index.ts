import { MercuriosClient } from "./client";

export default {
    connect({ url, id }: { url: string; id?: string }) {
        return MercuriosClient(url, id);
    },
};
