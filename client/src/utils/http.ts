import axios, { AxiosRequestConfig } from "axios";

export const $http = axios.create({
    headers: {
        "Access-Control-Allow-Origin": "*",
    },
});
