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

export interface MercuriosMessage {
    subscription: string;
    subject: string;
    event: MercuriosEvent;
}

export interface MercuriosEvent {
    topic: string;
    seq?: number;
    key?: string;
    published_at: string;
    data: any;
}

export interface MercuriosEventHandler {
    (message: MercuriosMessage): void;
}

export interface ServerMessage {
    action: "subscribe" | "unsubscribe";
    topic?: string;
    subscription?: string;
    queue?: string;
}
