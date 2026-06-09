import { describe, it, expect, vi } from "vitest";
import { saveMessage } from "../services/chat.service.js";
import type { PrismaClient } from "@prisma/client";

const mockMessage = {
  id: "msg-1",
  text: "Hello world",
  userId: "user-1",
  roomId: "room-1",
  createdAt: new Date(),
  user: { id: "user-1", username: "alice", avatarUrl: null },
};

const makePrisma = () =>
  ({
    message: { create: vi.fn().mockResolvedValue(mockMessage) },
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
