import type { Server, Socket } from "socket.io";
import type { PrismaClient } from "@prisma/client";
import { saveMessage, editMessage, softDeleteMessage } from "../../services/chat.service.js";

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

  const onEdit = async (socket: Socket, payload: { messageId: string; text: string }) => {
    const { messageId, text } = payload;
    if (!text?.trim()) {
      socket.emit("error", { code: "INVALID_MESSAGE", message: "Message text cannot be empty" });
      return;
    }
    try {
      const message = await editMessage(prisma, { messageId, userId: socket.userId!, text: text.trim() });
      io.to(message.roomId).emit("message:edited", message);
    } catch {
      socket.emit("error", { code: "NOT_AUTHORIZED", message: "You can only edit your own messages" });
    }
  };

  const onDelete = async (socket: Socket, payload: { messageId: string }) => {
    const { messageId } = payload;
    try {
      const message = await softDeleteMessage(prisma, { messageId, userId: socket.userId! });
      io.to(message.roomId).emit("message:deleted", { messageId: message.id, roomId: message.roomId });
    } catch {
      socket.emit("error", { code: "NOT_AUTHORIZED", message: "You can only delete your own messages" });
    }
  };

  return { onSend, onEdit, onDelete };
};
