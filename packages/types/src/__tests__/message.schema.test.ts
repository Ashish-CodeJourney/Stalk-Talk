import { describe, it, expect } from "vitest";
import { MessageSchema, type Message } from "../message.schema.js";

describe("MessageSchema", () => {
  it("accepts a valid message", () => {
    const input = {
      id: "clx000000000000000000002",
      text: "Hello world",
      userId: "clx000000000000000000000",
      roomId: "clx000000000000000000001",
      createdAt: new Date().toISOString(),
    };
    expect(MessageSchema.parse(input)).toMatchObject({ text: "Hello world" });
  });

  it("rejects a message with empty text", () => {
    const input = {
      id: "clx000000000000000000002",
      text: "",
      userId: "clx000000000000000000000",
      roomId: "clx000000000000000000001",
      createdAt: new Date().toISOString(),
    };
    expect(() => MessageSchema.parse(input)).toThrow();
  });

  it("rejects a message exceeding 2000 characters", () => {
    const input = {
      id: "clx000000000000000000002",
      text: "a".repeat(2001),
      userId: "clx000000000000000000000",
      roomId: "clx000000000000000000001",
      createdAt: new Date().toISOString(),
    };
    expect(() => MessageSchema.parse(input)).toThrow();
  });

  it("derives Message type from schema", () => {
    const message: Message = {
      id: "clx000000000000000000002",
      text: "Hello",
      userId: "clx000000000000000000000",
      roomId: "clx000000000000000000001",
      createdAt: new Date().toISOString(),
    };
    expect(message.text).toBe("Hello");
  });

  it("accepts an edited message with editedAt set", () => {
    const input = {
      id: "clx000000000000000000002",
      text: "Hello world (edited)",
      userId: "clx000000000000000000000",
      roomId: "clx000000000000000000001",
      createdAt: new Date().toISOString(),
      editedAt: new Date().toISOString(),
    };
    expect(MessageSchema.parse(input).editedAt).toBeDefined();
  });

  it("accepts a soft-deleted message with deletedAt set", () => {
    const input = {
      id: "clx000000000000000000002",
      text: "Hello world",
      userId: "clx000000000000000000000",
      roomId: "clx000000000000000000001",
      createdAt: new Date().toISOString(),
      deletedAt: new Date().toISOString(),
    };
    expect(MessageSchema.parse(input).deletedAt).toBeDefined();
  });
});
