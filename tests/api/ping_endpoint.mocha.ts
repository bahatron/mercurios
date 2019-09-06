import { expect } from "chai";
import $env from "../../src/adapters/env";
import $axios from "../../src/adapters/axios";

const BASE_URL = $env.get("TEST_API_URL", "http://localhost:3000");

describe("GET /ping", () => {
    it("returns a pong", async () => {
        const response = await $axios.get(`${BASE_URL}/ping`);

        expect(response.status).to.eq(200);
        expect(response.data).to.eq("pong");
    });
});
