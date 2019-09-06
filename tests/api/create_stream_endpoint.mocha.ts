import $env from "../../src/adapters/env";
import $mocha from "../settings.mocha";
import $streams, {
    STREAM_DEFINITIONS
} from "../../src/domain/streams/stream_repository";
import { AxiosResponse } from "axios";
import { Stream } from "../../src/domain/streams/stream_factory";
import $axios from "../../src/adapters/axios";
import { Schema } from "jsonschema";
import $db from "../../src/services/db";

describe("POST /streams", () => {
    const TOPIC = "create_stream_http_endpoint_test";
    const API_URL = $env.get("TEST_API_URL", "http://localhost:3000");

    async function createStreamEndpoint(payload: any) {
        return $axios.post<Stream>(`${API_URL}/streams`, payload);
    }

    describe("Scenario: with a valid payload", () => {
        const PAYLOAD = {
            topic: TOPIC,
            schema: <Schema>{
                type: "object",
                properties: {
                    foo: {
                        type: "string"
                    }
                }
            }
        };

        let RESPONSE: AxiosResponse<Stream>;
        before(async () => {
            await $db.truncate(STREAM_DEFINITIONS);

            RESPONSE = await createStreamEndpoint(PAYLOAD);
        });

        it("returns http status code 201", async () => {
            $mocha.expect(RESPONSE.status).to.eq(201);
        });

        it("returns http status code 200 if stream already exists", async () => {
            let response = await createStreamEndpoint(PAYLOAD);

            $mocha.expect(response.status).to.eq(200);
        });

        it("creates a stream", async () => {
            let stream = $streams.fetch(RESPONSE.data.topic);

            $mocha.expect(Boolean(stream)).to.be.true;
        });

        it("returns the created stream", async () => {
            $mocha.expect(RESPONSE.data).to.deep.eq(PAYLOAD);
        });
    });
});
