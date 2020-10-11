import axios from "axios";

export const $axios = axios.create({
    headers: {
        "Access-Control-Allow-Origin": "*",
    },
});
