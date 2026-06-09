import { describe, it, expect, vi, beforeEach } from "vitest";
import { buildApp } from "../app.js";
import type { PrismaClient } from "@prisma/client";

const JWT_SECRET = "test-secret-at-least-32-chars-long!!";
const REFRESH_SECRET = "refresh-secret-at-least-32-chars!!";

const mockUser = {
  id: "user-1",
  email: "alice@example.com",
  username: "alice",
  avatarUrl: "https://avatars.githubusercontent.com/u/1",
  provider: "github",
  providerId: "gh-1",
  refreshToken: null,
  createdAt: new Date(),
};

const makePrisma = (overrides: Partial<PrismaClient> = {}) =>
  ({
    user: {
      upsert: vi.fn().mockResolvedValue(mockUser),
      findUnique: vi.fn().mockResolvedValue(mockUser),
      update: vi.fn().mockResolvedValue(mockUser),
    },
    ...overrides,
  }) as unknown as PrismaClient;

describe("GET /auth/github", () => {
  it("redirects to GitHub OAuth authorization URL", async () => {
    const app = buildApp({ prisma: makePrisma(), jwtSecret: JWT_SECRET, refreshSecret: REFRESH_SECRET });
    const res = await app.inject({ method: "GET", url: "/auth/github" });
    expect(res.statusCode).toBe(302);
    expect(res.headers["location"]).toContain("github.com");
    await app.close();
  });
});

describe("GET /auth/github/callback", () => {
  it("returns 400 when the code query param is missing", async () => {
    const app = buildApp({ prisma: makePrisma(), jwtSecret: JWT_SECRET, refreshSecret: REFRESH_SECRET });
    const res = await app.inject({ method: "GET", url: "/auth/github/callback" });
    expect(res.statusCode).toBe(400);
    await app.close();
  });
});

describe("POST /auth/refresh", () => {
  it("returns 401 when no refresh token cookie is present", async () => {
    const app = buildApp({ prisma: makePrisma(), jwtSecret: JWT_SECRET, refreshSecret: REFRESH_SECRET });
    const res = await app.inject({ method: "POST", url: "/auth/refresh" });
    expect(res.statusCode).toBe(401);
    await app.close();
  });
});

describe("DELETE /auth/logout", () => {
  it("clears the refresh token cookie and returns 204", async () => {
    const app = buildApp({ prisma: makePrisma(), jwtSecret: JWT_SECRET, refreshSecret: REFRESH_SECRET });
    const res = await app.inject({ method: "DELETE", url: "/auth/logout" });
    expect(res.statusCode).toBe(204);
    expect(res.headers["set-cookie"]).toBeDefined();
    await app.close();
  });
});

describe("GET /users/me", () => {
  it("returns 401 without Authorization header", async () => {
    const app = buildApp({ prisma: makePrisma(), jwtSecret: JWT_SECRET, refreshSecret: REFRESH_SECRET });
    const res = await app.inject({ method: "GET", url: "/users/me" });
    expect(res.statusCode).toBe(401);
    await app.close();
  });

  it("returns the current user with a valid token", async () => {
    const { signAccessToken } = await import("../services/token.service.js");
    const token = signAccessToken({ userId: "user-1", secret: JWT_SECRET });
    const app = buildApp({ prisma: makePrisma(), jwtSecret: JWT_SECRET, refreshSecret: REFRESH_SECRET });
    const res = await app.inject({
      method: "GET",
      url: "/users/me",
      headers: { authorization: `Bearer ${token}` },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().username).toBe("alice");
    await app.close();
  });
});
