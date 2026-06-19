import { describe, it, expect } from "vitest";
import {
  RoomJoinPayloadSchema,
  RoomLeavePayloadSchema,
  MessageSendPayloadSchema,
  MessageEditPayloadSchema,
  MessageDeletePayloadSchema,
  TypingPayloadSchema,
  MessageNewEventSchema,
  MessageEditedEventSchema,
  MessageDeletedEventSchema,
  RoomUsersEventSchema,
  TypingUpdateEventSchema,
  SocketErrorSchema,
} from "../socket.schema.js";

describe("Socket event schemas — client to server", () => {
  it("accepts a valid room:join payload", () => {
    expect(RoomJoinPayloadSchema.parse({ roomId: "clx01" })).toEqual({ roomId: "clx01" });
  });

  it("rejects room:join with missing roomId", () => {
    expect(() => RoomJoinPayloadSchema.parse({})).toThrow();
  });

  it("accepts a valid room:leave payload", () => {
    expect(RoomLeavePayloadSchema.parse({ roomId: "clx01" })).toEqual({ roomId: "clx01" });
  });

  it("accepts a valid message:send payload", () => {
    const payload = { roomId: "clx01", text: "hi" };
    expect(MessageSendPayloadSchema.parse(payload)).toEqual(payload);
  });

  it("rejects message:send with empty text", () => {
    expect(() => MessageSendPayloadSchema.parse({ roomId: "clx01", text: "" })).toThrow();
  });

  it("accepts a valid typing payload", () => {
    expect(TypingPayloadSchema.parse({ roomId: "clx01" })).toEqual({ roomId: "clx01" });
  });

  it("accepts a valid message:edit payload", () => {
    const payload = { messageId: "clx02", text: "updated" };
    expect(MessageEditPayloadSchema.parse(payload)).toEqual(payload);
  });

  it("rejects message:edit with empty text", () => {
    expect(() => MessageEditPayloadSchema.parse({ messageId: "clx02", text: "" })).toThrow();
  });

  it("accepts a valid message:delete payload", () => {
    expect(MessageDeletePayloadSchema.parse({ messageId: "clx02" })).toEqual({ messageId: "clx02" });
  });
});

describe("Socket event schemas — server to client", () => {
  it("accepts a valid message:new event", () => {
    const event = {
      id: "clx02",
      text: "Hello",
      userId: "clx00",
      roomId: "clx01",
      createdAt: new Date().toISOString(),
    };
    expect(MessageNewEventSchema.parse(event)).toMatchObject({ text: "Hello" });
  });

  it("accepts a valid room:users event with public-safe user fields only", () => {
    const event = {
      roomId: "clx01",
      users: [{ id: "clx00", username: "alice", avatarUrl: null }],
    };
    expect(RoomUsersEventSchema.parse(event).users).toHaveLength(1);
  });

  it("rejects room:users containing private fields like email", () => {
    const event = {
      roomId: "clx01",
      users: [{ id: "clx00", username: "alice", avatarUrl: null, email: "a@b.com" }],
    };
    expect(RoomUsersEventSchema.parse(event).users[0]).not.toHaveProperty("email");
  });

  it("accepts a valid typing:update event", () => {
    const event = { roomId: "clx01", userId: "clx00", isTyping: true };
    expect(TypingUpdateEventSchema.parse(event)).toMatchObject({ isTyping: true });
  });

  it("accepts a socket error with code and message", () => {
    const err = { code: "UNAUTHORIZED", message: "Token expired" };
    expect(SocketErrorSchema.parse(err)).toMatchObject(err);
  });

  it("accepts a valid message:edited event", () => {
    const event = {
      id: "clx02",
      text: "updated",
      userId: "clx00",
      roomId: "clx01",
      createdAt: new Date().toISOString(),
      editedAt: new Date().toISOString(),
    };
    expect(MessageEditedEventSchema.parse(event)).toMatchObject({ text: "updated" });
  });

  it("accepts a valid message:deleted event", () => {
    const event = { messageId: "clx02", roomId: "clx01" };
    expect(MessageDeletedEventSchema.parse(event)).toEqual(event);
  });
});
