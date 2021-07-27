import * as client from "./client/client";
export * from "./client/client";

import * as interfaces from "./client/interfaces";
export * from "./client/interfaces";

export function connect(params: interfaces.ConnectOptions) {
    return client.MercuriosClient(params);
}

export default {
    connect,
};
