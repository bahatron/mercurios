import {
    Connection,
    MercuriosEvent,
    MercuriosEventHandler,
} from "./connection";
import { $http } from "../utils/http";
import { $error } from "../utils/error";
import { AxiosError } from "axios";
import { v4 } from "uuid";
import { $json, Logger } from "@bahatron/utils";

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
    debug?: boolean;
}

export type MercuriosClient = ReturnType<typeof MercuriosClient>;
export function MercuriosClient({
    url: _url,
    id: _id = v4(),
    debug: _debug = false,
}: ConnectOptions) {
    const _logger = Logger({
        debug: _debug,
        pretty: false,
        id: `mercurios:client:${_id}`,
        formatter: $json.stringify,
    });

    _logger.debug({ _url, _id }, "creating mercurios client...");

    let _socket = Connection(_url, _id, _logger);

    return {
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

            _logger.debug({ topic }, `subscription request sent`);

            return subscription;
        },

        async unsubscribe(subscription: string): Promise<void> {
            await _socket.send({
                action: "unsubscribe",
                subscription,
            });

            _logger.debug({ subscription }, "removed subscription");
        },
    };
}
