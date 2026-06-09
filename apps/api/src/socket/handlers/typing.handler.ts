import type { Socket } from "socket.io";

export const makeTypingHandlers = () => {
  const onTypingStart = (socket: Socket, payload: { roomId: string }) => {
    socket.broadcast.to(payload.roomId).emit("typing:update", {
      roomId: payload.roomId,
      userId: socket.userId,
      isTyping: true,
    });
  };

  const onTypingStop = (socket: Socket, payload: { roomId: string }) => {
    socket.broadcast.to(payload.roomId).emit("typing:update", {
      roomId: payload.roomId,
      userId: socket.userId,
      isTyping: false,
    });
  };

  return { onTypingStart, onTypingStop };
};
