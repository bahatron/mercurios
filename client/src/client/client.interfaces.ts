export interface AppendOptions {
    data?: any;
    key?: string;
    expectedSeq?: number;
}

export interface ConnectOptions {
    url: string;
    debug?: boolean;
}

export interface ListTopicsOptions {
    like?: string;
    withEvents?: EventFilters;
    limit?: number;
    offset?: number;
}

export interface EventFilters {
    from?: number;
    to?: number;
    key?: string;
    before?: string;
    after?: string;
}

export interface ConnectOptions {
    url: string;
    debug?: boolean;
}