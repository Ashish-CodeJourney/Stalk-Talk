import type { Server, Socket } from "socket.io";
import type { PrismaClient } from "@prisma/client";
import { saveMessage } from "../../services/chat.service.js";

export const makeMessageHandler = (io: Server, prisma: PrismaClient) => {
  const onSend = async (socket: Socket, payload: { roomId: string; text: string }) => {
    const { roomId, text } = payload;
    if (!text?.trim()) {
      socket.emit("error", { code: "INVALID_MESSAGE", message: "Message text cannot be empty" });
      return;
    }
    const message = await saveMessage(prisma, { userId: socket.userId!, roomId, text: text.trim() });
    io.to(roomId).emit("message:new", message);
  };

  return { onSend };
};
