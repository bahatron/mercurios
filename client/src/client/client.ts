import {
    ClientSocket,
    MercuriosEvent,
    MercuriosEventHandler,
} from "./client_socket";
import { $axios } from "../utils/axios";
import { $error } from "../utils/error";

export interface PublishOptions {
    data?: any;
    expectedSeq?: number;
}

export interface SubscribeOptions {
    queue?: string;
}

function randomString(): string {
    let generator = () => Math.random().toString(36).substring(2);

    return `${generator().repeat(2)}`;
}

export function MercuriosClient(_url: string, _id?: string) {
    let _socket = ClientSocket(_url, _id);

    return {
        async publish(
            topic: string,
            options: PublishOptions = {}
        ): Promise<MercuriosEvent> {
            try {
                let { data, expectedSeq } = options;

                let response = await $axios.post(
                    `${_url}/publish/${topic}`,
                    {
                        data,
                        expectedSeq,
                    },
                    {
                        headers: {
                            "Access-Control-Allow-Origin": "*",
                        },
                    }
                );

                return response.data;
            } catch (err) {
                throw $error.HttpError(err);
            }
        },

        async emit(
            topic: string,
            options: PublishOptions = {}
        ): Promise<MercuriosEvent> {
            try {
                let { data, expectedSeq } = options;

                let response = await $axios.post(
                    `${_url}/emit/${topic}`,
                    {
                        data,
                        expectedSeq,
                    },
                    {
                        headers: {
                            "Access-Control-Allow-Origin": "*",
                        },
                    }
                );

                return response.data;
            } catch (err) {
                throw $error.HttpError(err);
            }
        },

        async read(topic: string, seq: number): Promise<MercuriosEvent> {
            try {
                let response = await $axios.get(
                    `${_url}/read/${topic}/${seq}`,
                    {
                        headers: {
                            "Access-Control-Allow-Origin": "*",
                        },
                    }
                );

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

            let subscription = randomString();

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
                action: "subscribe",
                subscription,
            });
        },
    };
}
