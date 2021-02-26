import * as client from "./client/client";

export * from "./client/client";
export {
    MercuriosMessage,
    MercuriosEvent,
    MercuriosEventHandler,
} from "./client/connection";

export function connect(params: { url: string; id?: string }) {
    return client.MercuriosClient(params);
}

export default {
    connect,
};
