import type { Server, Socket } from "socket.io";
import type { PrismaClient } from "@prisma/client";
import { toggleReaction } from "../../services/reaction.service.js";

export const makeReactionHandler = (io: Server, prisma: PrismaClient) => {
  const onToggle = async (socket: Socket, payload: { messageId: string; emoji: string }) => {
    const { messageId, emoji } = payload;
    try {
      const { roomId, reactions } = await toggleReaction(prisma, {
        messageId,
        userId: socket.userId!,
        emoji,
      });
      io.to(roomId).emit("reaction:updated", { messageId, roomId, reactions });
    } catch {
      socket.emit("error", { code: "MESSAGE_NOT_FOUND", message: "Message not found" });
    }
  };

  return { onToggle };
};
