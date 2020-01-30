const SERVER_URL = "http://localhost:3000";

/** @todo: contain to browser side */
function createWsClient() {
    let client = new WebSocket(SERVER_URL);

    client.onopen = event => {
        console.log(`ws client connection open`);
    };
}

export const state = () => {
    return {};
};

export const getters = {
    hello: (state: any) => "hello from the store!",
};
