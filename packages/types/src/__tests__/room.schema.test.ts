import { describe, it, expect } from "vitest";
import { RoomSchema, type Room } from "../room.schema.js";

describe("RoomSchema", () => {
  it("accepts a valid room", () => {
    const input = {
      id: "clx000000000000000000001",
      name: "general",
      createdAt: new Date().toISOString(),
    };
    expect(RoomSchema.parse(input)).toMatchObject({ name: "general" });
  });

  it("rejects a room with an empty name", () => {
    const input = {
      id: "clx000000000000000000001",
      name: "",
      createdAt: new Date().toISOString(),
    };
    expect(() => RoomSchema.parse(input)).toThrow();
  });

  it("rejects a room whose name exceeds 50 characters", () => {
    const input = {
      id: "clx000000000000000000001",
      name: "a".repeat(51),
      createdAt: new Date().toISOString(),
    };
    expect(() => RoomSchema.parse(input)).toThrow();
  });

  it("derives Room type from schema", () => {
    const room: Room = {
      id: "clx000000000000000000001",
      name: "general",
      createdAt: new Date().toISOString(),
    };
    expect(room.name).toBe("general");
  });

  it("accepts a room with an unreadCount", () => {
    const input = {
      id: "clx000000000000000000001",
      name: "general",
      createdAt: new Date().toISOString(),
      unreadCount: 5,
    };
    expect(RoomSchema.parse(input).unreadCount).toBe(5);
  });
});
