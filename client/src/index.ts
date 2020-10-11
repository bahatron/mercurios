import * as client from "./client";
export * from "./client";

export function connect(params: { url: string; id?: string }) {
    return client.MercuriosClient(params);
}

export default {
    connect,
};
