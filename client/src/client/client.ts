import { Connection } from "./connection";
import { $http } from "../utils/axios";
import { $error } from "../utils/error";
import { AxiosError } from "axios";
import { v4 } from "uuid";
import { Logger } from "@bahatron/utils";
import {
    ConnectOptions,
    FilterOptions,
    PublishOptions,
    SubscribeOptions,
    EmitOptions,
    MercuriosEvent,
    MercuriosEventHandler,
} from "./interfaces";

export type MercuriosClient = ReturnType<typeof MercuriosClient>;
export function MercuriosClient({
    url: _url,
    id: _id = v4(),
    debug: _debug = false,
}: ConnectOptions) {
    const _logger = Logger.Logger({
        debug: _debug,
        pretty: false,
        id: `mercurios:client:${_id}`,
    });

    _logger.debug({ _url, _id }, "connecting to mercurios server...");

    let _connection = Connection(_url, _id, _logger);

    return {
        async close() {
            await _connection.close();
        },

        async ping(): Promise<boolean> {
            try {
                await $http.get(`${_url}/ping`);
                return true;
            } catch (err) {
                return false;
            }
        },

        async topics(
            params: {
                like?: string;
                withEvents?: FilterOptions;
                limit?: number;
                offset?: number;
            } = {}
        ): Promise<string[]> {
            try {
                let response = await $http.get(`${_url}/topics`, {
                    params,
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

            _connection.on(subscription, handler);

            await _connection.send({
                action: "subscribe",
                topic,
                subscription,
                queue,
            });

            _logger.debug({ topic }, `subscription request sent`);

            return subscription;
        },

        async unsubscribe(subscription: string): Promise<void> {
            await _connection.send({
                action: "unsubscribe",
                subscription,
            });

            _connection.off(subscription);

            _logger.debug({ subscription }, "removed subscription");
        },
    };
}
