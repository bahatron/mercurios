import createStream from "./create_stream";
import publishEvent from "./publish_event";
import readEvent from "./read_event";

const $domain = {
    publishEvent,
    readEvent,
    createStream,
};

export default $domain;
