import * as client from "./client/client";
import { ConnectOptions } from "./client/interfaces";

export * from "./client/client";
export * from "./client/interfaces";

export function connect(params: ConnectOptions) {
    return client.MercuriosClient(params);
}

export default {
    connect,
};
