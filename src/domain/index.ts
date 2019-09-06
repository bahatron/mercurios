import $streams from "./streams/stream_repository";
import publishEvent from "./events/publish_event";
import readEvent from "./events/read_event";

/** @todo: remove streams */
const $domain = {
    publishEvent,
    readEvent,
    streams: $streams
};

export { StreamRepository } from "./streams/stream_repository";
export default $domain;
