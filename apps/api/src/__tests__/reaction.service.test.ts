import { describe, it, expect, vi } from "vitest";
import { toggleReaction } from "../services/reaction.service.js";
import type { PrismaClient } from "@prisma/client";

const makePrisma = (overrides: Record<string, unknown> = {}) =>
  ({
    message: {
      findUnique: vi.fn().mockResolvedValue({ id: "msg-1", roomId: "room-1" }),
    },
    reaction: {
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({}),
      delete: vi.fn().mockResolvedValue({}),
      findMany: vi.fn().mockResolvedValue([
        { emoji: "👍", userId: "user-1" },
        { emoji: "👍", userId: "user-2" },
        { emoji: "🎉", userId: "user-1" },
      ]),
      ...((overrides["reaction"] as object) ?? {}),
    },
  }) as unknown as PrismaClient;

describe("toggleReaction", () => {
  it("creates a reaction when none exists for that user/message/emoji", async () => {
    const prisma = makePrisma();
    await toggleReaction(prisma, { messageId: "msg-1", userId: "user-1", emoji: "👍" });
    expect(prisma.reaction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { userId: "user-1", messageId: "msg-1", emoji: "👍" },
      })
    );
  });

  it("removes the reaction when it already exists (toggle off)", async () => {
    const prisma = makePrisma({
      reaction: { findUnique: vi.fn().mockResolvedValue({ id: "r1" }) },
    });
    await toggleReaction(prisma, { messageId: "msg-1", userId: "user-1", emoji: "👍" });
    expect(prisma.reaction.delete).toHaveBeenCalledWith({ where: { id: "r1" } });
    expect(prisma.reaction.create).not.toHaveBeenCalled();
  });

  it("returns the roomId and aggregated reaction summary grouped by emoji", async () => {
    const prisma = makePrisma();
    const result = await toggleReaction(prisma, { messageId: "msg-1", userId: "user-1", emoji: "👍" });
    expect(result.roomId).toBe("room-1");
    expect(result.reactions).toEqual([
      { emoji: "👍", userIds: ["user-1", "user-2"] },
      { emoji: "🎉", userIds: ["user-1"] },
    ]);
  });

  it("throws when the message does not exist", async () => {
    const prisma = makePrisma({});
    (prisma.message.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    await expect(
      toggleReaction(prisma, { messageId: "nope", userId: "user-1", emoji: "👍" })
    ).rejects.toThrow("Message not found");
  });
});
