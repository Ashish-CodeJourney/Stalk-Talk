import { describe, it, expect } from "vitest";
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  hashToken,
  verifyTokenHash,
} from "../services/token.service.js";

const SECRET = "test-secret-at-least-32-chars-long!!";

describe("signAccessToken", () => {
  it("returns a non-empty JWT string", () => {
    const token = signAccessToken({ userId: "user-1", secret: SECRET });
    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(3);
  });

  it("encodes the userId in the payload", () => {
    const token = signAccessToken({ userId: "user-42", secret: SECRET });
    const payload = verifyAccessToken({ token, secret: SECRET });
    expect(payload.userId).toBe("user-42");
  });
});

describe("signRefreshToken", () => {
  it("returns a non-empty JWT string", () => {
    const token = signRefreshToken({ userId: "user-1", secret: SECRET });
    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(3);
  });

  it("is different from the access token for same user", () => {
    const access = signAccessToken({ userId: "user-1", secret: SECRET });
    const refresh = signRefreshToken({ userId: "user-1", secret: SECRET });
    expect(access).not.toBe(refresh);
  });
});

describe("verifyAccessToken", () => {
  it("returns the userId for a valid token", () => {
    const token = signAccessToken({ userId: "user-99", secret: SECRET });
    expect(verifyAccessToken({ token, secret: SECRET }).userId).toBe("user-99");
  });

  it("throws for a tampered token", () => {
    const token = signAccessToken({ userId: "user-1", secret: SECRET });
    const tampered = token.slice(0, -4) + "xxxx";
    expect(() => verifyAccessToken({ token: tampered, secret: SECRET })).toThrow();
  });

  it("throws for a token signed with a different secret", () => {
    const token = signAccessToken({ userId: "user-1", secret: SECRET });
    expect(() =>
      verifyAccessToken({ token, secret: "wrong-secret-at-least-32-chars!!" })
    ).toThrow();
  });
});

describe("hashToken / verifyTokenHash", () => {
  it("produces a hash different from the original", async () => {
    const hash = await hashToken("my-refresh-token");
    expect(hash).not.toBe("my-refresh-token");
  });

  it("verifies correctly when token matches hash", async () => {
    const hash = await hashToken("my-refresh-token");
    expect(await verifyTokenHash("my-refresh-token", hash)).toBe(true);
  });

  it("rejects when token does not match hash", async () => {
    const hash = await hashToken("correct-token");
    expect(await verifyTokenHash("wrong-token", hash)).toBe(false);
  });
});
