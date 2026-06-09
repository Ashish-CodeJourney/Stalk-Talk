import { describe, it, expect, vi } from "vitest";
import { buildApp } from "../app.js";
import type { PrismaClient } from "@prisma/client";

const JWT_SECRET = "test-secret-at-least-32-chars-long!!";
const REFRESH_SECRET = "refresh-secret-at-least-32-chars!!";

const makePrisma = () =>
  ({
    user: {
      upsert: vi.fn().mockResolvedValue({ id: "u1", username: "alice", email: "a@b.com", provider: "google", providerId: "1", refreshToken: null, createdAt: new Date() }),
      update: vi.fn(),
    },
  }) as unknown as PrismaClient;

describe("GET /auth/google", () => {
  it("redirects to Google OAuth authorization URL", async () => {
    const app = buildApp({ prisma: makePrisma(), jwtSecret: JWT_SECRET, refreshSecret: REFRESH_SECRET });
    const res = await app.inject({ method: "GET", url: "/auth/google" });
    expect(res.statusCode).toBe(302);
    expect(res.headers["location"]).toContain("accounts.google.com");
    await app.close();
  });
});

describe("GET /auth/google/callback", () => {
  it("returns 400 when the code query param is missing", async () => {
    const app = buildApp({ prisma: makePrisma(), jwtSecret: JWT_SECRET, refreshSecret: REFRESH_SECRET });
    const res = await app.inject({ method: "GET", url: "/auth/google/callback" });
    expect(res.statusCode).toBe(400);
    await app.close();
  });
});
