import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeRoomHandlers } from "../socket/handlers/room.handler.js";
import { makeMessageHandler } from "../socket/handlers/message.handler.js";
import { makeTypingHandlers } from "../socket/handlers/typing.handler.js";
import type { PrismaClient } from "@prisma/client";
import type Redis from "ioredis";

const makeSocket = (userId = "user-1") => {
  const toMock = { emit: vi.fn() };
  const broadcastToMock = { emit: vi.fn() };
  return {
    id: "socket-1",
    userId,
    join: vi.fn(),
    leave: vi.fn(),
    emit: vi.fn(),
    to: vi.fn().mockReturnValue(toMock),
    broadcast: { to: vi.fn().mockReturnValue(broadcastToMock) },
    _toMock: toMock,
    _broadcastToMock: broadcastToMock,
  };
};

const makeIo = () => {
  const toMock = { emit: vi.fn() };
  return { to: vi.fn().mockReturnValue(toMock), _toMock: toMock };
};

const makePrisma = () =>
  ({
    message: {
      create: vi.fn().mockResolvedValue({
        id: "msg-1",
        text: "hello",
        userId: "user-1",
        roomId: "room-1",
        createdAt: new Date(),
        user: { id: "user-1", username: "alice", avatarUrl: null },
      }),
    },
    room: { findUnique: vi.fn().mockResolvedValue({ id: "room-1", name: "general" }) },
    user: {
      findMany: vi.fn().mockResolvedValue([
        { id: "user-1", username: "alice", avatarUrl: null },
      ]),
    },
  }) as unknown as PrismaClient;

const makeRedis = () =>
  ({
    set: vi.fn().mockResolvedValue("OK"),
    del: vi.fn().mockResolvedValue(1),
    keys: vi.fn().mockResolvedValue(["presence:room-1:user-1"]),
  }) as unknown as Redis;

describe("room.handler — onJoin", () => {
  it("calls socket.join with the roomId", async () => {
    const socket = makeSocket();
    const io = makeIo();
    const { onJoin } = makeRoomHandlers(io as never, makePrisma(), makeRedis());
    await onJoin(socket as never, { roomId: "room-1" });
    expect(socket.join).toHaveBeenCalledWith("room-1");
  });

  it("emits room:users to the room after join", async () => {
    const socket = makeSocket();
    const io = makeIo();
    const { onJoin } = makeRoomHandlers(io as never, makePrisma(), makeRedis());
    await onJoin(socket as never, { roomId: "room-1" });
    expect(io.to).toHaveBeenCalledWith("room-1");
    expect(io._toMock.emit).toHaveBeenCalledWith(
      "room:users",
      expect.objectContaining({ roomId: "room-1" })
    );
  });

  it("emits room:users with full user objects, not raw IDs", async () => {
    const socket = makeSocket();
    const io = makeIo();
    const { onJoin } = makeRoomHandlers(io as never, makePrisma(), makeRedis());
    await onJoin(socket as never, { roomId: "room-1" });
    expect(io._toMock.emit).toHaveBeenCalledWith(
      "room:users",
      { roomId: "room-1", users: [{ id: "user-1", username: "alice", avatarUrl: null }] }
    );
  });

  it("emits an error event if room does not exist", async () => {
    const socket = makeSocket();
    const io = makeIo();
    const prisma = makePrisma();
    (prisma.room.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const { onJoin } = makeRoomHandlers(io as never, prisma, makeRedis());
    await onJoin(socket as never, { roomId: "nonexistent" });
    expect(socket.emit).toHaveBeenCalledWith("error", expect.objectContaining({ code: "ROOM_NOT_FOUND" }));
  });
});

describe("room.handler — onLeave", () => {
  it("calls socket.leave with the roomId", async () => {
    const socket = makeSocket();
    const io = makeIo();
    const { onLeave } = makeRoomHandlers(io as never, makePrisma(), makeRedis());
    await onLeave(socket as never, { roomId: "room-1" });
    expect(socket.leave).toHaveBeenCalledWith("room-1");
  });

  it("emits updated room:users after leave", async () => {
    const socket = makeSocket();
    const io = makeIo();
    const { onLeave } = makeRoomHandlers(io as never, makePrisma(), makeRedis());
    await onLeave(socket as never, { roomId: "room-1" });
    expect(io._toMock.emit).toHaveBeenCalledWith(
      "room:users",
      expect.objectContaining({ roomId: "room-1" })
    );
  });
});

describe("message.handler — onSend", () => {
  it("saves the message and emits message:new to the room", async () => {
    const socket = makeSocket();
    const io = makeIo();
    const { onSend } = makeMessageHandler(io as never, makePrisma());
    await onSend(socket as never, { roomId: "room-1", text: "hello" });
    expect(io.to).toHaveBeenCalledWith("room-1");
    expect(io._toMock.emit).toHaveBeenCalledWith("message:new", expect.objectContaining({ text: "hello" }));
  });

  it("emits an error if text is empty", async () => {
    const socket = makeSocket();
    const io = makeIo();
    const { onSend } = makeMessageHandler(io as never, makePrisma());
    await onSend(socket as never, { roomId: "room-1", text: "" });
    expect(socket.emit).toHaveBeenCalledWith("error", expect.objectContaining({ code: "INVALID_MESSAGE" }));
  });
});

describe("typing.handler", () => {
  it("onTypingStart broadcasts typing:update with isTyping true to the room", () => {
    const socket = makeSocket();
    const { onTypingStart } = makeTypingHandlers();
    onTypingStart(socket as never, { roomId: "room-1" });
    expect(socket.broadcast.to).toHaveBeenCalledWith("room-1");
    expect(socket._broadcastToMock.emit).toHaveBeenCalledWith(
      "typing:update",
      { roomId: "room-1", userId: "user-1", isTyping: true }
    );
  });

  it("onTypingStop broadcasts typing:update with isTyping false to the room", () => {
    const socket = makeSocket();
    const { onTypingStop } = makeTypingHandlers();
    onTypingStop(socket as never, { roomId: "room-1" });
    expect(socket._broadcastToMock.emit).toHaveBeenCalledWith(
      "typing:update",
      { roomId: "room-1", userId: "user-1", isTyping: false }
    );
  });
});
