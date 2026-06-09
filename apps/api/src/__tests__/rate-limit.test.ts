import { describe, it, expect } from "vitest";
import { buildApp } from "../app.js";

describe("rate limiting", () => {
  it("returns 429 after exceeding the request limit", async () => {
    const app = buildApp({ rateLimit: { max: 3, timeWindow: "1 minute" } });

    for (let i = 0; i < 3; i++) {
      await app.inject({ method: "GET", url: "/health" });
    }

    const res = await app.inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(429);
    await app.close();
  });

  it("returns 200 within the rate limit", async () => {
    const app = buildApp({ rateLimit: { max: 10, timeWindow: "1 minute" } });
    const res = await app.inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    await app.close();
  });
});
