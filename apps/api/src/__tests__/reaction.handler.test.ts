import { describe, it, expect, vi } from "vitest";
import { makeReactionHandler } from "../socket/handlers/reaction.handler.js";
import type { PrismaClient } from "@prisma/client";

const makeSocket = (userId = "user-1") => ({ id: "socket-1", userId, emit: vi.fn() });

const makeIo = () => {
  const toMock = { emit: vi.fn() };
  return { to: vi.fn().mockReturnValue(toMock), _toMock: toMock };
};

const makePrisma = (overrides: Record<string, unknown> = {}) =>
  ({
    message: { findUnique: vi.fn().mockResolvedValue({ id: "msg-1", roomId: "room-1" }) },
    reaction: {
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({}),
      delete: vi.fn().mockResolvedValue({}),
      findMany: vi.fn().mockResolvedValue([{ emoji: "👍", userId: "user-1" }]),
      ...((overrides["reaction"] as object) ?? {}),
    },
  }) as unknown as PrismaClient;

describe("reaction.handler — onToggle", () => {
  it("toggles the reaction and emits reaction:updated to the room", async () => {
    const socket = makeSocket();
    const io = makeIo();
    const { onToggle } = makeReactionHandler(io as never, makePrisma());
    await onToggle(socket as never, { messageId: "msg-1", emoji: "👍" });
    expect(io.to).toHaveBeenCalledWith("room-1");
    expect(io._toMock.emit).toHaveBeenCalledWith(
      "reaction:updated",
      { messageId: "msg-1", roomId: "room-1", reactions: [{ emoji: "👍", userIds: ["user-1"] }] }
    );
  });

  it("emits an error when the message does not exist", async () => {
    const socket = makeSocket();
    const io = makeIo();
    const prisma = makePrisma();
    (prisma.message.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const { onToggle } = makeReactionHandler(io as never, prisma);
    await onToggle(socket as never, { messageId: "nope", emoji: "👍" });
    expect(socket.emit).toHaveBeenCalledWith("error", expect.objectContaining({ code: "MESSAGE_NOT_FOUND" }));
  });
});
