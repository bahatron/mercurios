import { Client } from "ts-nats";
import $ws from "ws";
import { IncomingMessage } from "http";

export interface ConnectionParams {
    id: string;
    dispatcher: Client;
    socket: $ws;
    request: IncomingMessage;
}

export class WsConnection {
    constructor({ id, dispatcher, socket, request }: ConnectionParams) {}
}

const $connection = (params: ConnectionParams): WsConnection => {
    return new WsConnection(params);
};
export default $connection;
