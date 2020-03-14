// import $ws from "ws";
// import $env from "@bahatron/env";
// import $logger from "@bahatron/logger";
// import { _publishEvent } from "../api/publish_event.mocha";

// const TEST_URL = $env.get("TEST_URL");

// describe("Feature: unsubscribe to topic", () => {
//     let _wsc: $ws;

//     before(async () => {
//         return new Promise(resolve => {
//             _wsc = new $ws(TEST_URL);

//             _wsc.on("open", () => {
//                 resolve();
//             });
//         });
//     });

//     it("can subcribe to a topic", async () => {
//         const _topic = "ws_unsubscribe_test";

//         $logger.warning("subscribing first");

//         // first subscribe to a topic
//         await new Promise(resolve => {
//             _wsc.once("message", data => {
//                 resolve();
//             });

//             _wsc.send(
//                 JSON.stringify({
//                     action: "subscribe",
//                     topic: _topic,
//                 }),

//                 err => {
//                     if (err) {
//                         $logger.warning(`wsc error`, err);
//                     }

//                     _publishEvent(_topic);
//                 }
//             );
//         });

//         $logger.warning("validated subscription works");

//         return new Promise(async (resolve, reject) => {
//             _wsc.once("message", data => {
//                 reject(new Error("should not recieve a message"));
//             });

//             _wsc.send(
//                 JSON.stringify({
//                     action: "unsubscribe",
//                     topic: _topic,
//                 }),

//                 err => {
//                     if (err) {
//                         $logger.warning(`wsc error`, err);
//                     }

//                     setTimeout(resolve, 500);

//                     $logger.info("publishing...");
//                     _publishEvent(_topic);
//                 }
//             );
//         });
//     });
// });
