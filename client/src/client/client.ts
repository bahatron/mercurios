import {
    Connection,
    MercuriosEvent,
    MercuriosEventHandler,
} from "./connection";
import { $http } from "../utils/axios";
import { $error } from "../utils/error";
import { AxiosError } from "axios";
import { v4 } from "uuid";

export interface FilterOptions {
    from?: number;
    to?: number;
    key?: string;
    after?: string;
    before?: string;
}

export interface PublishOptions {
    data?: any;
    expectedSeq?: number;
    key?: string;
}

export interface EmitOptions {
    data?: any;
}

export interface SubscribeOptions {
    queue?: string;
}

export interface ConnectOptions {
    url: string;
    id?: string;
}

export type MercuriosClient = ReturnType<typeof MercuriosClient>;
export function MercuriosClient({ url: _url, id: _id }: ConnectOptions) {
    let _socket = Connection(_url, _id);

    return {
        get socket() {
            return _socket;
        },

        async close() {
            await _socket.close();
        },

        async ping(): Promise<boolean> {
            try {
                await $http.get(`${_url}/ping`);
                return true;
            } catch (err) {
                return false;
            }
        },

        async topics({
            like,
            withEvents,
        }: {
            like?: string;
            withEvents?: FilterOptions;
        } = {}): Promise<string[]> {
            try {
                let response = await $http.get(`${_url}/topics`, {
                    params: {
                        like,
                        withEvents: withEvents
                            ? JSON.stringify(withEvents)
                            : undefined,
                    },
                });

                return response.data;
            } catch (err) {
                throw $error.HttpError(err);
            }
        },

        async publish(
            topic: string,
            options: PublishOptions = {}
        ): Promise<MercuriosEvent> {
            try {
                let response = await $http.post(
                    `${_url}/publish/${topic}`,
                    options
                );

                return response.data;
            } catch (err) {
                throw $error.HttpError(err);
            }
        },

        async emit(
            topic: string,
            options: EmitOptions = {}
        ): Promise<MercuriosEvent> {
            try {
                let response = await $http.post(
                    `${_url}/emit/${topic}`,
                    options
                );

                return response.data;
            } catch (err) {
                throw $error.HttpError(err);
            }
        },

        async read(
            topic: string,
            seq: "latest" | number
        ): Promise<MercuriosEvent | undefined> {
            try {
                let response = await $http.get(`${_url}/read/${topic}/${seq}`);

                return response.data;
            } catch (err) {
                if ((err as AxiosError)?.response?.status === 404) {
                    return undefined;
                }

                throw $error.HttpError(err);
            }
        },

        async filter(
            topic: string,
            options: FilterOptions = {}
        ): Promise<MercuriosEvent[]> {
            try {
                let response = await $http.get(`${_url}/filter/${topic}`, {
                    params: options,
                });

                return response.data;
            } catch (err) {
                throw $error.HttpError(err);
            }
        },

        async subscribe(
            topic: string,
            handler: MercuriosEventHandler,
            options: SubscribeOptions = {}
        ): Promise<string> {
            let { queue } = options;

            let subscription = v4();

            _socket.on(subscription, handler);

            await _socket.send({
                action: "subscribe",
                topic,
                subscription,
                queue,
            });

            return subscription;
        },

        async unsubscribe(subscription: string): Promise<void> {
            await _socket.send({
                action: "unsubscribe",
                subscription,
            });
        },
    };
}
