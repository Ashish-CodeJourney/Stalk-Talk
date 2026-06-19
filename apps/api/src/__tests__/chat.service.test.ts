import { describe, it, expect, vi } from "vitest";
import { saveMessage, editMessage, softDeleteMessage } from "../services/chat.service.js";
import type { PrismaClient } from "@prisma/client";

const mockMessage = {
  id: "msg-1",
  text: "Hello world",
  userId: "user-1",
  roomId: "room-1",
  createdAt: new Date(),
  user: { id: "user-1", username: "alice", avatarUrl: null },
};

const makePrisma = (overrides: Record<string, unknown> = {}) =>
  ({
    message: {
      create: vi.fn().mockResolvedValue(mockMessage),
      findUnique: vi.fn().mockResolvedValue(mockMessage),
      update: vi.fn().mockResolvedValue({ ...mockMessage, text: "edited", editedAt: new Date() }),
      ...((overrides["message"] as object) ?? {}),
    },
  }) as unknown as PrismaClient;

describe("saveMessage", () => {
  it("persists the message via prisma and returns it with user", async () => {
    const prisma = makePrisma();
    const result = await saveMessage(prisma, { userId: "user-1", roomId: "room-1", text: "Hello world" });
    expect(result.text).toBe("Hello world");
    expect(result.user.username).toBe("alice");
  });

  it("calls prisma.message.create with correct payload", async () => {
    const prisma = makePrisma();
    await saveMessage(prisma, { userId: "user-1", roomId: "room-1", text: "Hi" });
    expect(prisma.message.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: "user-1", roomId: "room-1", text: "Hi" }),
      })
    );
  });

  it("throws when prisma rejects", async () => {
    const prisma = makePrisma();
    (prisma.message.create as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("DB error"));
    await expect(saveMessage(prisma, { userId: "u", roomId: "r", text: "t" })).rejects.toThrow("DB error");
  });
});

describe("editMessage", () => {
  it("updates the message text and sets editedAt when the requester is the author", async () => {
    const prisma = makePrisma();
    const result = await editMessage(prisma, { messageId: "msg-1", userId: "user-1", text: "edited" });
    expect(prisma.message.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "msg-1" },
        data: expect.objectContaining({ text: "edited", editedAt: expect.any(Date) }),
      })
    );
    expect(result.text).toBe("edited");
  });

  it("throws when the message does not exist", async () => {
    const prisma = makePrisma({ message: { findUnique: vi.fn().mockResolvedValue(null) } });
    await expect(
      editMessage(prisma, { messageId: "nope", userId: "user-1", text: "edited" })
    ).rejects.toThrow("Message not found");
  });

  it("throws when the requester is not the author", async () => {
    const prisma = makePrisma();
    await expect(
      editMessage(prisma, { messageId: "msg-1", userId: "user-2", text: "edited" })
    ).rejects.toThrow("Not authorized");
    expect(prisma.message.update).not.toHaveBeenCalled();
  });
});

describe("softDeleteMessage", () => {
  it("sets deletedAt when the requester is the author", async () => {
    const prisma = makePrisma({
      message: { update: vi.fn().mockResolvedValue({ ...mockMessage, deletedAt: new Date() }) },
    });
    await softDeleteMessage(prisma, { messageId: "msg-1", userId: "user-1" });
    expect(prisma.message.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "msg-1" },
        data: expect.objectContaining({ deletedAt: expect.any(Date) }),
      })
    );
  });

  it("throws when the message does not exist", async () => {
    const prisma = makePrisma({ message: { findUnique: vi.fn().mockResolvedValue(null) } });
    await expect(softDeleteMessage(prisma, { messageId: "nope", userId: "user-1" })).rejects.toThrow(
      "Message not found"
    );
  });

  it("throws when the requester is not the author", async () => {
    const prisma = makePrisma();
    await expect(softDeleteMessage(prisma, { messageId: "msg-1", userId: "user-2" })).rejects.toThrow(
      "Not authorized"
    );
    expect(prisma.message.update).not.toHaveBeenCalled();
  });
});
