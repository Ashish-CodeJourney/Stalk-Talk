import { describe, it, expect } from "vitest";
import { buildApp } from "../app.js";

describe("buildApp", () => {
  it("returns a Fastify instance", async () => {
    const app = buildApp();
    expect(app).toBeDefined();
    await app.close();
  });

  it("GET /health returns 200 with status ok", async () => {
    const app = buildApp();
    const response = await app.inject({ method: "GET", url: "/health" });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "ok" });
  });

  it("unknown route returns 404", async () => {
    const app = buildApp();
    const response = await app.inject({ method: "GET", url: "/not-a-route" });
    expect(response.statusCode).toBe(404);
    await app.close();
  });
});
