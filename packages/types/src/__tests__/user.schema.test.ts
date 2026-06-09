import { describe, it, expect } from "vitest";
import { UserSchema, type User } from "../user.schema.js";

describe("UserSchema", () => {
  it("accepts a valid user", () => {
    const input = {
      id: "clx000000000000000000000",
      email: "alice@example.com",
      username: "alice",
      provider: "github",
      providerId: "12345",
      createdAt: new Date().toISOString(),
    };
    expect(UserSchema.parse(input)).toMatchObject({
      id: input.id,
      email: input.email,
      username: input.username,
    });
  });

  it("rejects a user with an invalid email", () => {
    const input = {
      id: "clx000000000000000000000",
      email: "not-an-email",
      username: "alice",
      provider: "github",
      providerId: "12345",
      createdAt: new Date().toISOString(),
    };
    expect(() => UserSchema.parse(input)).toThrow();
  });

  it("rejects a user with an empty username", () => {
    const input = {
      id: "clx000000000000000000000",
      email: "alice@example.com",
      username: "",
      provider: "github",
      providerId: "12345",
      createdAt: new Date().toISOString(),
    };
    expect(() => UserSchema.parse(input)).toThrow();
  });

  it("rejects an unsupported OAuth provider", () => {
    const input = {
      id: "clx000000000000000000000",
      email: "alice@example.com",
      username: "alice",
      provider: "twitter",
      providerId: "12345",
      createdAt: new Date().toISOString(),
    };
    expect(() => UserSchema.parse(input)).toThrow();
  });

  it("allows optional avatarUrl to be absent", () => {
    const input = {
      id: "clx000000000000000000000",
      email: "alice@example.com",
      username: "alice",
      provider: "google",
      providerId: "67890",
      createdAt: new Date().toISOString(),
    };
    const result = UserSchema.parse(input);
    expect(result.avatarUrl).toBeUndefined();
  });

  it("derives User type from schema", () => {
    const user: User = {
      id: "clx000000000000000000000",
      email: "alice@example.com",
      username: "alice",
      provider: "github",
      providerId: "12345",
      createdAt: new Date().toISOString(),
    };
    expect(user.provider).toBe("github");
  });
});
