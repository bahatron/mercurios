import axios from "axios";

const $axios = axios.create({
    headers: {
        "Access-Control-Allow-Origin": "*",
    },
});

export default $axios;
