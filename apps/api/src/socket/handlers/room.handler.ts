import type { Server, Socket } from "socket.io";
import type { PrismaClient } from "@prisma/client";
import type Redis from "ioredis";
import { setUserOnline, setUserOffline, getOnlineUserIds } from "../../services/presence.service.js";

declare module "socket.io" {
  interface Socket {
    userId?: string;
  }
}

const broadcastRoomUsers = async (io: Server, prisma: PrismaClient, redis: Redis, roomId: string) => {
  const userIds = await getOnlineUserIds(redis, roomId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, username: true, avatarUrl: true },
  });
  io.to(roomId).emit("room:users", { roomId, users });
};

export const makeRoomHandlers = (io: Server, prisma: PrismaClient, redis: Redis) => {
  const onJoin = async (socket: Socket, payload: { roomId: string }) => {
    const { roomId } = payload;
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) {
      socket.emit("error", { code: "ROOM_NOT_FOUND", message: "Room does not exist" });
      return;
    }
    socket.join(roomId);
    if (socket.userId) await setUserOnline(redis, roomId, socket.userId);
    await broadcastRoomUsers(io, prisma, redis, roomId);
  };

  const onLeave = async (socket: Socket, payload: { roomId: string }) => {
    const { roomId } = payload;
    socket.leave(roomId);
    if (socket.userId) await setUserOffline(redis, roomId, socket.userId);
    await broadcastRoomUsers(io, prisma, redis, roomId);
  };

  return { onJoin, onLeave };
};
